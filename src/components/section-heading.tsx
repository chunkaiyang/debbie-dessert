export function SectionHeading({
  title,
  chinese,
  description,
  align = "left",
}: {
  title: string;
  chinese: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <h2 className="display text-4xl leading-tight font-semibold md:text-6xl">{title}</h2>
      <p className="mt-2 font-serif text-xl text-caramel">{chinese}</p>
      {description ? <p className="mt-5 leading-8 text-cocoa/70">{description}</p> : null}
    </div>
  );
}
