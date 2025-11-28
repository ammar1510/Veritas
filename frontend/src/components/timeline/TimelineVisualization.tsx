import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { Event } from '../../types/timeline';
import { getPriorityColor, getPrioritySize } from '../../utils/colorScale';
import { formatDateTime } from '../../utils/dateFormatter';
import { getCredibilityHexColor } from '../../utils/credibilityScore';

interface TimelineVisualizationProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
}

interface TimelineNode {
  event: Event;
  date: Date;
  x: number;
  y: number;
  hasBranches: boolean;
  index: number;
}

export default function TimelineVisualization({ events, onEventClick }: TimelineVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 });
  const [hoveredEvent, setHoveredEvent] = useState<Event | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        // Calculate width based on max branches
        const maxBranches = Math.max(...events.map(e => e.branches.length), 1);
        // leftMargin(160) + branchStartX(120) + (maxBranches * branchSpacing(80)) + rightPadding(200)
        const minWidth = Math.max(1000, 160 + 120 + maxBranches * 80 + 200);
        // Ensure minimum spacing of 120px per event vertically
        setDimensions({
          width: Math.max(width, minWidth),
          height: Math.max(800, events.length * 120 + 100)
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [events]);

  // Draw timeline
  useEffect(() => {
    if (!svgRef.current || events.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const margin = { top: 40, right: 200, bottom: 40, left: 160 };
    const height = dimensions.height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Sort events by date
    const sortedEvents = [...events].sort(
      (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
    );

    // Create timeline nodes with index-based positioning
    const nodes: TimelineNode[] = sortedEvents.map((event, index) => ({
      event,
      date: new Date(event.event_date),
      x: 0,
      y: 0,
      hasBranches: event.branches.length > 1,
      index,
    }));

    // Use index-based scale for even spacing
    const yScale = d3
      .scaleLinear()
      .domain([0, nodes.length - 1])
      .range([0, height]);

    // Position nodes
    nodes.forEach((node) => {
      node.y = yScale(node.index);
      node.x = 0; // Main timeline axis
    });

    // Draw vertical timeline axis
    g.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', height)
      .attr('stroke', '#d1d5db')
      .attr('stroke-width', 3);

    // Draw date/time labels on the left
    nodes.forEach((node) => {
      const dateTime = formatDateTime(node.event.event_date);
      const [datePart, timePart] = dateTime.split(',');

      g.append('text')
        .attr('x', -25)
        .attr('y', node.y - 5)
        .attr('text-anchor', 'end')
        .text(datePart.trim())
        .style('font-size', '11px')
        .style('font-weight', '600')
        .style('fill', '#374151');

      g.append('text')
        .attr('x', -25)
        .attr('y', node.y + 8)
        .attr('text-anchor', 'end')
        .text(timePart?.trim() || '')
        .style('font-size', '10px')
        .style('fill', '#6b7280');
    });

    // Draw event nodes
    const eventGroups = g
      .selectAll('.event-node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'event-node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer');

    // Event circles
    eventGroups
      .append('circle')
      .attr('r', (d) => getPrioritySize(d.event.priority))
      .attr('fill', (d) => getPriorityColor(d.event.priority))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .on('mouseenter', function (evt, d) {
        setHoveredEvent(d.event);
        const [x, y] = d3.pointer(evt, svgRef.current);
        setTooltipPos({ x, y });
        d3.select(this).attr('r', getPrioritySize(d.event.priority) * 1.3);
      })
      .on('mouseleave', function (_evt, d) {
        setHoveredEvent(null);
        d3.select(this).attr('r', getPrioritySize(d.event.priority));
      })
      .on('click', (_evt, d) => {
        if (onEventClick) onEventClick(d.event);
      });

    // Event labels (title) - positioned above the timeline axis
    eventGroups
      .append('text')
      .attr('x', 20)
      .attr('y', -15)
      .text((d) => {
        const title = d.event.title;
        const maxLength = 50;
        return title.length > maxLength ? title.substring(0, 47) + '...' : title;
      })
      .style('font-size', '14px')
      .style('font-weight', '500')
      .style('fill', '#1f2937')
      .style('pointer-events', 'none');

    // Priority badge - positioned above, below the title
    eventGroups
      .append('text')
      .attr('x', 20)
      .attr('y', -2)
      .text((d) => `${d.event.priority} • ${d.event.sources.length} sources`)
      .style('font-size', '11px')
      .style('fill', '#6b7280')
      .style('pointer-events', 'none');

    // Draw branches for events with multiple narratives
    nodes.forEach((node) => {
      if (node.event.branches.length > 1) {
        // Sort branches by credibility (highest first)
        const sortedBranches = [...node.event.branches].sort(
          (a, b) => b.credibility_score - a.credibility_score
        );

        // Draw branch paths - positioned below the event node
        sortedBranches.forEach((branch, idx) => {
          const branchX = 120 + idx * 80; // Start closer since title is now above
          const branchY = node.y + 15; // Position branches below the event node

          // Connecting line from main timeline to branch
          g.append('path')
            .attr(
              'd',
              `M 0,${node.y} L 0,${branchY} L ${branchX},${branchY}`
            )
            .attr('fill', 'none')
            .attr('stroke', getCredibilityHexColor(branch.credibility_score))
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', idx === 0 ? '0' : '5,3')
            .attr('opacity', 0.6);

          // Branch node
          g.append('circle')
            .attr('cx', branchX)
            .attr('cy', branchY)
            .attr('r', 7)
            .attr('fill', getCredibilityHexColor(branch.credibility_score))
            .attr('stroke', '#fff')
            .attr('stroke-width', 2);

          // Branch label background
          const labelText = `${Math.round(branch.credibility_score * 100)}%`;
          const labelWidth = 36;
          g.append('rect')
            .attr('x', branchX - labelWidth / 2)
            .attr('y', branchY + 8)
            .attr('width', labelWidth)
            .attr('height', 16)
            .attr('rx', 3)
            .attr('fill', 'white')
            .attr('stroke', getCredibilityHexColor(branch.credibility_score))
            .attr('stroke-width', 1.5);

          // Branch label (credibility %)
          g.append('text')
            .attr('x', branchX)
            .attr('y', branchY + 19)
            .attr('text-anchor', 'middle')
            .text(labelText)
            .style('font-size', '11px')
            .style('font-weight', '700')
            .style('fill', getCredibilityHexColor(branch.credibility_score));

          // Branch narrative label (first few words)
          if (idx === 0) {
            g.append('text')
              .attr('x', branchX)
              .attr('y', branchY - 10)
              .attr('text-anchor', 'middle')
              .text('Main')
              .style('font-size', '9px')
              .style('font-weight', '600')
              .style('fill', '#6b7280');
          }
        });

        // Add branch count indicator - positioned below branches
        g.append('text')
          .attr('x', 20)
          .attr('y', node.y + 45)
          .text(`${node.event.branches.length} narratives`)
          .style('font-size', '10px')
          .style('font-weight', '600')
          .style('fill', '#9ca3af')
          .style('pointer-events', 'none');
      }
    });
  }, [events, dimensions, onEventClick]);

  return (
    <div ref={containerRef} className="relative w-full overflow-x-auto">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />

      {/* Tooltip */}
      {hoveredEvent && (
        <div
          className="absolute bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg pointer-events-none z-10 max-w-sm"
          style={{
            left: `${tooltipPos.x + 10}px`,
            top: `${tooltipPos.y - 10}px`,
          }}
        >
          <div className="font-semibold mb-1">{hoveredEvent.title}</div>
          <div className="text-sm text-gray-300 mb-2">
            {formatDateTime(hoveredEvent.event_date)}
          </div>
          <div className="text-xs text-gray-400">
            Priority: {hoveredEvent.priority} •{' '}
            {hoveredEvent.branches.length} narrative
            {hoveredEvent.branches.length !== 1 ? 's' : ''} •{' '}
            {hoveredEvent.sources.length} source
            {hoveredEvent.sources.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
