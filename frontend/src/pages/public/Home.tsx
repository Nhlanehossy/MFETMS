import { Link } from "react-router-dom";
import { ArrowRight, Building2, CalendarDays, MapPin, Trophy } from "lucide-react";
import { useDashboardData } from "../../hooks/useApiData";
import { MatchCard } from "../../components/MatchCard";
import { CompetitionCard } from "../../components/CompetitionCard";
import { StatCard } from "../../components/ui/StatCard";
import { Button } from "../../components/ui/Button";
import { SkeletonGrid } from "../../components/ui/Skeleton";

export default function Home() {
  const data = useDashboardData();
  if (data.isLoading) return <SkeletonGrid />;

  return (
    <>
      <section className="hero-pattern rounded-2xl p-6 text-white shadow-xl md:p-10">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-normal text-mf-gold">Malawi football ticketing platform</p>
          <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">Buy, manage, and verify match tickets nationwide.</h1>
          <p className="mt-5 max-w-2xl text-lg text-white/80">
            MFETMS connects FAM, SULOM, clubs, stadium gates, and supporters through one professional football operations system.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link className="rounded-lg bg-mf-gold px-5 py-3 font-bold text-mf-ink" to="/matches">
              Browse Matches
            </Link>
            <Link className="rounded-lg border border-white/30 px-5 py-3 font-bold text-white" to="/login">
              System Login
            </Link>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <StatCard icon={CalendarDays} label="Matches" value={data.matches.length} detail="Scheduled fixtures" />
        <StatCard icon={Trophy} label="Competitions" value={data.competitions.length} detail="National football calendar" />
        <StatCard icon={Building2} label="Clubs" value={data.clubs.length} detail="Participating teams" />
        <StatCard icon={MapPin} label="Stadiums" value={data.stadiums.length} detail="Match venues" />
      </section>

      <section className="page-shell">
        <div className="page-header">
          <div>
            <p className="page-kicker">Upcoming fixtures</p>
            <h2 className="page-title">Matches Open for Ticketing</h2>
          </div>
          <Link to="/matches"><Button variant="secondary">View all <ArrowRight size={16} /></Button></Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {data.matches.slice(0, 3).map((match) => <MatchCard key={match.id} match={match} publicLinks />)}
        </div>
      </section>

      <section id="calendar" className="page-shell">
        <div>
          <p className="page-kicker">Featured competitions</p>
          <h2 className="page-title">National Football Calendar</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.competitions.slice(0, 6).map((competition) => <CompetitionCard key={competition.id} competition={competition} clubCount={data.clubs.length} />)}
        </div>
      </section>
    </>
  );
}
