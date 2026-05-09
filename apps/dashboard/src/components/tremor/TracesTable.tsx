'use client';

import { Badge, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@tremor/react';

export interface TraceRow {
  id: string;
  agent: string;
  status: 'success' | 'error' | 'running';
  duration: string;
  timestamp: string;
}

const STATUS_COLOR: Record<TraceRow['status'], 'emerald' | 'red' | 'yellow'> = {
  success: 'emerald',
  error: 'red',
  running: 'yellow',
};

interface TracesTableProps {
  rows: TraceRow[];
}

export function TracesTable({ rows }: TracesTableProps) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>ID</TableHeaderCell>
          <TableHeaderCell>Agent</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Duration</TableHeaderCell>
          <TableHeaderCell>Timestamp</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-mono text-xs">{row.id}</TableCell>
            <TableCell>{row.agent}</TableCell>
            <TableCell>
              <Badge color={STATUS_COLOR[row.status]}>{row.status}</Badge>
            </TableCell>
            <TableCell>{row.duration}</TableCell>
            <TableCell className="text-gray-500">{row.timestamp}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
