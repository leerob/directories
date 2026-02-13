export const metadata = {
  title: "About Cursor Directory",
  description: "Why we built Cursor Directory",
};

export default function About() {
  return (
    <div className="flex flex-col items-center justify-center max-w-screen-md mx-auto px-6 py-12">
      <h1 className="text-4xl mb-12 mt-20 text-center">
        Why We Built <br />
        Cursor Directory
      </h1>

      <div className="space-y-12 mt-10">
        <section>
          <p className="text-[#878787] leading-relaxed text-sm">
            Our journey with Cursor has been transformative. As team of one
            developer and a designer, we've experienced firsthand how Cursor
            significantly accelerated our development process. This efficiency
            boost gave us the bandwidth to build our two startups,{" "}
            <a
              href="https://go.midday.ai/8cX3F4o"
              className="text-primary border-border border-dashed border-b-[1px]"
            >
              Midday
            </a>{" "}
            and{" "}
            <a
              href="https://go.midday.ai/NnI1CUO"
              className="text-primary border-border border-dashed border-b-[1px]"
            >
              Languine
            </a>{" "}
            with incredible velocity.
          </p>
        </section>

        <section>
          <h2 className="text-xl mb-2">Our Approach</h2>
          <p className="text-[#878787] leading-relaxed text-sm">
            As a bootstrapped company, we believe in sustainable growth and
            maintaining full control over our product vision. We're building our
            platforms thoughtfully, prioritizing user needs over rapid scaling.
            With Midday, we're streamlining business operations, while with
            Languine, we're building localization infrastructure that helps
            fast-paced startups reach global audiences without slowing down
            their development velocity.
          </p>
        </section>

        <section>
          <h2 className="text-xl mb-2">Open Source Commitment</h2>
          <p className="text-[#878787] leading-relaxed text-sm">
            We're deeply committed to open source principles. Both Midday and
            Languine are being built in public, with transparency at their core.
            We believe that collaboration with the community leads to better
            products, and we're proud to contribute back to the open source
            ecosystem. This commitment remains central to our mission, even as
            we grow and evolve.
          </p>
        </section>

        <section>
          <h2 className="text-xl mb-2">Follow Our Journey</h2>
          <p className="text-[#878787] leading-relaxed text-sm">
            Follow{" "}
            <a
              href="https://x.com/pontusab"
              className="text-primary hover:underline"
            >
              @pontusab
            </a>{" "}
            and{" "}
            <a
              href="https://x.com/viktorhofte"
              className="text-primary hover:underline"
            >
              @viktorhofte
            </a>{" "}
            on X to stay updated with our latest developments on both Midday and
            Languine.
          </p>
        </section>

      </div>
    </div>
  );
}
