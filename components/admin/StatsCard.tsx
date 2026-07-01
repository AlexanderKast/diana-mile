type StatsCardProps = {
  label: string;
  value: number | string;
};

export default function StatsCard({ label, value }: StatsCardProps) {
  return (
    <div className="bg-blanco border border-arena rounded-[4px] p-5">
      <p className="text-xs text-ceniza uppercase tracking-wide">{label}</p>
      <p className="font-display text-3xl text-carbon mt-1">{value}</p>
    </div>
  );
}
