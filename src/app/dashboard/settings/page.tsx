import { requireCurrentUser } from "@/lib/auth/getCurrentUser";
import { db } from "@/lib/db";
import { deleteAccountAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function SettingsPage() {
  const user = await requireCurrentUser();
  const connection = await db.whoopConnection.findUnique({ where: { userId: user.id } });
  const whoopConnected = Boolean(connection && !connection.revokedAt);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>WHOOP connection</CardTitle>
          <CardDescription>
            {whoopConnected
              ? "Recovery Lab has read access to your recovery, sleep, and cycle data."
              : "WHOOP is not connected."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {whoopConnected ? (
            <form action="/api/whoop/disconnect" method="post">
              <Button variant="outline" type="submit">
                Disconnect WHOOP
              </Button>
            </form>
          ) : (
            <Button render={<a href="/api/whoop/connect">Connect WHOOP</a>} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your data</CardTitle>
          <CardDescription>
            Recovery Lab only stores what it needs to run your experiments: your account, your experiments and
            check-ins, and the WHOOP recovery/sleep/cycle data linked to them. Nothing is sold or shared.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="secondary" render={<a href="/api/account/export">Export my data (JSON)</a>} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delete account</CardTitle>
          <CardDescription>
            Permanently deletes your account, experiments, check-ins, and synced WHOOP data. This cannot be
            undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <form action={deleteAccountAction}>
            <Button variant="destructive" type="submit">
              Delete my account and all data
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
