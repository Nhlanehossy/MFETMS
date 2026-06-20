import { useMemo, useState } from "react";
import { MatchCard } from "../../components/MatchCard";
import { SearchInput, SelectFilter } from "../../components/FilterPanel";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonGrid } from "../../components/ui/Skeleton";
import { useDashboardData } from "../../hooks/useApiData";

export default function Matches() {
  const data = useDashboardData();
  const [search, setSearch] = useState("");
  const [competition, setCompetition] = useState("");
  const [stadium, setStadium] = useState("");

  const matches = useMemo(() => data.matches.filter((match) => {
    const text = `${match.label} ${match.home_team_name} ${match.away_team_name}`.toLowerCase();
    return text.includes(search.toLowerCase())
      && (!competition || match.competition?.name === competition)
      && (!stadium || match.stadium?.name === stadium);
  }), [data.matches, search, competition, stadium]);

  if (data.isLoading) return <SkeletonGrid />;

  return (
    <div className="page-shell">
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="page-kicker">Public match centre</p>
        <h1 className="page-title">Matches and Football Calendar</h1>
        <p className="mt-2 max-w-3xl text-slate-500">
          Browse upcoming fixtures, competition schedules, stadium assignments, and ticket categories before signing in to buy.
        </p>
      </section>

      <section className="grid gap-3 rounded-xl border border-mf-border bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_220px]">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by team or match" />
        <SelectFilter label="Competition" value={competition} onChange={setCompetition} options={data.competitions.map((item) => item.name)} />
        <SelectFilter label="Stadium" value={stadium} onChange={setStadium} options={data.stadiums.map((item) => item.name)} />
      </section>

      {matches.length ? (
        <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {matches.map((match) => <MatchCard key={match.id} match={match} publicLinks />)}
        </section>
      ) : (
        <EmptyState title="No matches found" message="Adjust your search or filters to view more fixtures." />
      )}
    </div>
  );
}
