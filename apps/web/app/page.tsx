import { Button } from "@/components/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/card";
import { MarketingFooter } from "@/components/footer";
import { Logo } from "@/components/logo";
import { MapPlaceholder } from "@/components/map-placeholder";
import { Navbar } from "@/components/navbar";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar variant="marketing" />

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:px-6 lg:py-24">
          <div className="space-y-6">
            <Logo className="text-2xl md:text-3xl" />
            <h1 className="font-heading text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              Track recycling.
              <br />
              Prove impact.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted md:text-lg">
              Every verified drop-off contributes to your impact record, and may earn appreciation
              tokens where a partner has them enabled.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button href="/dashboard" variant="primary" size="lg">
                Start recycling smarter
              </Button>
              <Button href="#partners" variant="secondary" size="lg">
                Partner as a company
              </Button>
            </div>
          </div>
          <div
            className="flex min-h-[280px] flex-col justify-end rounded-xl border border-border bg-elevated/60 p-6 md:min-h-[360px]"
            aria-hidden
          >
            <p className="text-xs font-medium uppercase tracking-wider text-muted">Visual</p>
            <p className="mt-2 font-heading text-lg text-foreground">Illustration placeholder</p>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Reserve this region for your approved brand artwork — African recycler with a smart bin
              and phone. No stock imagery is embedded here.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">How tareka works</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Three calm steps from drop-off to verified record — no hype, no guaranteed payouts.
        </p>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Drop off",
              body: "Bring separated materials to a verified partner site. Operators log intake quickly on tablet-first flows.",
            },
            {
              step: "02",
              title: "Get verified",
              body: "Each confirmation is anchored with cryptographic hashing so your impact record stays defensible.",
            },
            {
              step: "03",
              title: "Track impact",
              body: "See estimated weight and CO₂ (always labelled as estimates) plus appreciation tokens where configured.",
            },
          ].map((item) => (
            <li key={item.step}>
              <Card className="h-full">
                <p className="text-xs font-medium tabular-nums text-accent-cyan">{item.step}</p>
                <CardHeader className="mt-2 px-0">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.body}</CardDescription>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-border bg-surface/80">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-heading text-2xl font-semibold tracking-tight">Network visibility</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                The live directory is location-aware: filter by city (for example Nairobi and surrounding
                areas) and optionally share your position to prioritise partners with nearby collection
                coverage. Distances and coverage respect the APIs you enable — nothing is simulated here
                on the marketing page.
              </p>
              <div className="mt-6">
                <Button href="/directory" variant="primary">
                  Open directory
                </Button>
              </div>
            </div>
            <MapPlaceholder label="Nairobi-area preview" />
          </div>
        </div>
      </section>

      <section id="partners" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:px-6">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">Built for collection partners</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Give field teams a fast confirmation flow, give finance a weekly payout report, and give
          sustainability leads defensible estimated impact — without turning recycling into a game.
        </p>
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Digitise intake",
              body: "Replace paper tally sheets with structured confirmations and audit-friendly logs.",
            },
            {
              title: "Track contributors",
              body: "Know which recyclers drive volume while respecting consent and data minimisation.",
            },
            {
              title: "Generate reports",
              body: "Export CSV and weekly payout views so KES obligations stay outside the platform ledger.",
            },
          ].map((item) => (
            <li key={item.title}>
              <Card className="h-full border-accent-cyan/15">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <CardDescription>{item.body}</CardDescription>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <MarketingFooter />
    </div>
  );
}
