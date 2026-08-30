export function BrandedHeader() {
  return (
    <div className="w-full bg-white border-b border-border">
      <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img 
              src="/semh-logo.jpg" 
              alt="SEMH Logo" 
              className="h-12 w-12 object-contain"
            />
          </div>
          
          {/* Branding */}
          <div className="flex flex-col">
            <h1 className="font-display text-lg font-bold text-foreground">SEMH</h1>
            <p className="text-xs text-muted-foreground">SEMH.co.uk Free Toolkit</p>
          </div>
        </div>
      </div>
    </div>
  );
}
