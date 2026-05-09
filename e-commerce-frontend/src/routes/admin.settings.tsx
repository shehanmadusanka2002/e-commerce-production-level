import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const [storeName, setStoreName] = useState("Atelier");
  const [contactEmail, setContactEmail] = useState("hello@atelier.shop");
  const [supportPhone, setSupportPhone] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [shippingRate, setShippingRate] = useState("9.00");
  const [description, setDescription] = useState("Considered objects, made to last.");

  function save(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Settings saved");
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure basic store details.</p>
      </div>

      <form onSubmit={save} className="space-y-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Store details</CardTitle>
            <CardDescription>Public information about your store.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="store-name">Store name</Label>
                <Input id="store-name" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Contact email</Label>
                <Input id="contact-email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-phone">Support phone</Label>
                <Input id="support-phone" value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} placeholder="+1 555 010 1234" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Tagline</Label>
              <Textarea id="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Commerce</CardTitle>
            <CardDescription>Pricing and shipping defaults.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD — US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR — Euro</SelectItem>
                    <SelectItem value="GBP">GBP — British Pound</SelectItem>
                    <SelectItem value="JPY">JPY — Japanese Yen</SelectItem>
                    <SelectItem value="AUD">AUD — Australian Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shipping">Flat shipping rate</Label>
                <Input id="shipping" type="number" min="0" step="0.01" value={shippingRate} onChange={(e) => setShippingRate(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline">Discard</Button>
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </div>
  );
}
