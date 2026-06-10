import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Star, TrendingUp, QrCode, Search, Download, Award } from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../../apiConfig';

interface LeaderboardEntry {
    rank: number;
    team_name: string;
    project_title: string;
    total_score: number;
    college?: string;
    prize?: string;
    stage_name?: string;
    judge_count?: number;
}

interface LeaderboardPageProps {
    eventId?: string;
    refreshCounter?: number;
    stages?: Array<{ id: string; name?: string }>;
}

const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ eventId, refreshCounter, stages = [] }) => {
    const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
    const [selectedStageId, setSelectedStageId] = useState('');

    useEffect(() => {
        if (stages.length > 0 && !selectedStageId) {
            setSelectedStageId(stages[0].id);
        }
    }, [stages, selectedStageId]);

    useEffect(() => {
        const fetchRankings = async () => {
            if (!eventId) return;
            setLoading(true);
            try {
                if (selectedStageId) {
                    const stageRes = await fetch(
                        `${API_BASE_URL}/api/v1/institution/events/${eventId}/stage-leaderboard?stage_id=${encodeURIComponent(selectedStageId)}`,
                        { headers: { ...authHeaders() } },
                    );
                    if (stageRes.ok) {
                        const data = await stageRes.json();
                        const mapped = (Array.isArray(data) ? data : []).map((d: any) => ({
                            rank: d.rank,
                            team_name: d.team_name || '',
                            project_title: d.project_title || d.stage_name || '',
                            total_score: Number(d.total_score ?? 0),
                            stage_name: d.stage_name,
                            judge_count: d.judge_count,
                        }));
                        setRankings(mapped);
                        return;
                    }
                }

                let res = await fetch(`${API_BASE_URL}/api/hackathons/events/${eventId}/leaderboard?include_all=true`, {
                    headers: { ...authHeaders() },
                });

                if (!res.ok) {
                    res = await fetch(`${API_BASE_URL}/api/judging/leaderboard/${eventId}`, {
                        headers: { ...authHeaders() },
                    });
                }

                if (res.ok) {
                    const data = await res.json();
                    const mapped = (Array.isArray(data) ? data : []).map((d: any) => ({
                        rank: d.rank,
                        team_name: d.teamName || d.team_name || d.student_name || '',
                        project_title: d.projectTitle || d.project_title || d.teamLead || d.student_name || '',
                        total_score: Number(d.totalScore ?? d.total_score ?? 0),
                        college: d.college || d.institution || d.institution_name,
                        criteria_scores: d.rubricScores || d.rubric_scores || {},
                    }));
                    setRankings(mapped);
                } else {
                    setRankings([]);
                }
            } catch (error) {
                try { console.error('Integration Error:', error instanceof Error ? error.message : String(error)); } catch (_) {}
                setRankings([]);
            } finally {
                setLoading(false);
            }
        };
        fetchRankings();
    }, [eventId, refreshCounter, selectedStageId]);

    if (loading) {
        return <div className="h-screen flex items-center justify-center bg-[#fafafa] text-gray-400 italic">Synchronizing Live Standings...</div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#fafafa]">
            <main className="p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <div>
                            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-2">
                                <TrendingUp size={14} />
                                Live Results
                            </div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Hall of Fame</h1>
                            <p className="text-gray-500 mt-1">Dynamic rankings powered by institutional scoring.</p>
                        </div>
                        {stages.length > 0 && (
                            <select
                                value={selectedStageId}
                                onChange={(e) => setSelectedStageId(e.target.value)}
                                className="px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700"
                            >
                                {stages.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name || s.id}</option>
                                ))}
                            </select>
                        )}
                        <div className="flex gap-2">
                            <button
                                onClick={async () => {
                                    if (window.confirm('Issue certificates to the Top 3 winners?')) {
                                        const res = await fetch(`${API_BASE_URL}/api/judging/issue-certificates`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json', ...authHeaders() },
                                            body: JSON.stringify({
                                                event_id: eventId,
                                                winners: rankings.slice(0, 3),
                                            }),
                                        });
                                        if (res.ok) alert('Certificates issued successfully!');
                                    }
                                }}
                                className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
                            >
                                <Award size={16} /> Issue Top 3
                            </button>
                        </div>
                    </div>

                    {rankings.length === 0 ? (
                        <div className="text-center py-24 text-slate-400 font-bold">No scored submissions for this stage yet.</div>
                    ) : (
                        <div className="space-y-4">
                            {rankings.map((entry) => (
                                <motion.div
                                    key={`${entry.rank}-${entry.team_name}`}
                                    layout
                                    className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center gap-6 shadow-sm"
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg ${
                                        entry.rank === 1 ? 'bg-amber-100 text-amber-600' :
                                        entry.rank === 2 ? 'bg-slate-200 text-slate-600' :
                                        entry.rank === 3 ? 'bg-orange-100 text-orange-600' :
                                        'bg-slate-50 text-slate-400'
                                    }`}>
                                        {entry.rank <= 3 ? <Trophy size={20} /> : entry.rank}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-slate-900 truncate">{entry.team_name}</h3>
                                        <p className="text-sm text-slate-500 truncate">{entry.project_title}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-[#6C3BFF]">{entry.total_score}</div>
                                        {entry.judge_count != null && (
                                            <div className="text-[10px] text-slate-400 uppercase tracking-widest">{entry.judge_count} judge(s)</div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default LeaderboardPage;
