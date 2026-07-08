import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface ExperimentCardData {
  id: string;
  title: string;
  hypothesis: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "ABANDONED";
  startDate: Date;
  endDate: Date;
}

export function ExperimentCard({ experiment }: { experiment: ExperimentCardData }) {
  const format = (date: Date) => date.toISOString().slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{experiment.title}</CardTitle>
          <Badge variant="outline">{experiment.status}</Badge>
        </div>
        <CardDescription>{experiment.hypothesis}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {format(experiment.startDate)} – {format(experiment.endDate)}
        </span>
        <Button
          variant="secondary"
          size="sm"
          render={<Link href={`/experiments/${experiment.id}`}>View results</Link>}
        />
      </CardContent>
    </Card>
  );
}
