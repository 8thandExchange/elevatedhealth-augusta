const InsuranceLogos = () => {
  return (
    <section id="insurance" className="py-20 lg:py-28 bg-secondary">
      <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
        <div className="text-center mb-16">
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4 font-lato font-light">
            Accessibility
          </p>
          <h2 className="text-3xl sm:text-4xl font-playfair text-foreground mb-4">
            Insurance Accepted
          </h2>
          <p className="text-muted-foreground font-lato font-light">
            We work with major insurance providers to make care accessible
          </p>
        </div>

        {/* Insurance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center p-8 bg-background rounded-sm">
            <span className="font-playfair text-3xl text-foreground">BCBS</span>
            <p className="text-sm text-muted-foreground font-lato mt-2">Blue Cross Blue Shield</p>
          </div>

          <div className="text-center p-8 bg-background rounded-sm">
            <span className="font-playfair text-3xl text-foreground">TRICARE</span>
            <p className="text-sm text-muted-foreground font-lato mt-2">Military Health System</p>
          </div>

          <div className="text-center p-8 bg-background rounded-sm">
            <span className="font-playfair text-3xl text-foreground">VA</span>
            <p className="text-sm text-muted-foreground font-lato mt-2">Veterans Affairs</p>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground font-lato font-light">
          Contact us to verify your coverage — more providers coming soon
        </p>
      </div>
    </section>
  );
};

export default InsuranceLogos;
