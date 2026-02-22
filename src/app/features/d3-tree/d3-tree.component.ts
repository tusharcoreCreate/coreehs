import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { D3TreeService, NodeRow } from 'src/app/services/d3-tree.service';

@Component({
  selector: 'app-d3-tree',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './d3-tree.component.html',
  styleUrls: ['./d3-tree.component.css'],
})
export class D3TreeComponent implements AfterViewInit {
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>;

  constructor(private api: D3TreeService) {}

  ngAfterViewInit(): void {
    this.api.getNodesFromPosts(15).subscribe(nodes => {
      this.render(nodes);
    });
  }

  private render(nodes: NodeRow[]): void {
  const el = this.host.nativeElement;
  el.innerHTML = '';

  const boxW = 260;
  const boxH = 80;

  const gapX = 300;
  const gapY = 150;

  const perRow = 5;

  const width = 1600;
  const height = 900;

  const svg = d3
    .select(el)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const positions: { x: number; y: number }[] = [];

  nodes.forEach((_, i) => {
    const row = Math.floor(i / perRow);
    const col = i % perRow;

    const y = row * gapY + 120;

    const isEvenRow = row % 2 === 0;

    const x = isEvenRow
      ? col * gapX + 150
      : (perRow - 1 - col) * gapX + 150;

    positions.push({ x, y });
  });

  for (let i = 1; i < positions.length; i++) {
    const prev = positions[i - 1];
    const curr = positions[i];

    svg.append('path')
      .attr('d', `M${prev.x},${prev.y}H${curr.x}V${curr.y}`)
      .attr('fill', 'none')
      .attr('stroke', '#111')
      .attr('stroke-width', 2);
  }
  nodes.forEach((node, i) => {
    const { x, y } = positions[i];

    const g = svg.append('g')
      .attr('transform', `translate(${x},${y})`);

    g.append('rect')
      .attr('x', -boxW / 2)
      .attr('y', -boxH / 2)
      .attr('width', boxW)
      .attr('height', boxH)
      .attr('fill', '#fff')
      .attr('stroke', '#111')
      .attr('stroke-width', 2);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -5)
      .attr('font-size', 13)
      .attr('font-weight', '600')
      .text(node.label.length > 35
        ? node.label.substring(0, 35) + '...'
        : node.label
      );

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 18)
      .attr('font-size', 12)
      .attr('fill', '#555')
      .text(`${node.parent ?? 'None'}`);
  });
}
}