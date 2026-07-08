import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HoverLift } from "@/components/motion";

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
    <HoverLift>
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium">{experiment.title}</p>
              <Badge variant="outline" className="shrink-0 font-mono text-[0.6rem] uppercase">
                {experiment.status.toLowerCase()}
              </Badge>
            </div>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              {format(experiment.startDate)} → {format(experiment.endDate)}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            render={<Link href={`/experiments/${experiment.id}`}>Open report</Link>}
          />
        </CardContent>
      </Card>
    </HoverLift>
  );
}
