"use client";

import { useEffect, useMemo, useState } from "react";
import { BowlingCenter } from "@/types";
import {
  MapPin,
  Search,
  Phone,
  Mail,
  Globe2,
  ChevronDown,
  ChevronUp,
  Building2,
  Compass,
  Layers,
  Loader2,
  Link as LinkIcon,
  Plus,
} from "lucide-react";
import AddCenterModal from "@/components/AddCenterModal";

const FALLBACK_LOGO = "/logo/logo.png";

const highlight = (text: string) => text || "Not provided";

type FetchState = "idle" | "loading" | "loaded" | "error";

export default function CentersPage() {
  const [centers, setCenters] = useState<BowlingCenter[]>([]);
  const [allCenters, setAllCenters] = useState<BowlingCenter[]>([]); // cache of full list
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [state, setState] = useState<FetchState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCenters = async (q?: string) => {
      setState("loading");
      setError(null);

      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        const headers: HeadersInit = { 'Accept': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const url = q ? `/api/centers?q=${encodeURIComponent(q)}` : '/api/centers';
        const response = await fetch(url, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
          headers,
        });

        if (response.status === 401) {
          // Unauthorized, redirect to signin to refresh token
          window.location.href = '/signin';
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load centers. Please try again.");
        }

        const data: BowlingCenter[] = await response.json();
        setCenters(data || []);
        if (!q) setAllCenters(data || []);
        setState("loaded");
      } catch (err) {
        if (controller.signal.aborted) return;
        const message = err instanceof Error ? err.message : "Failed to load centers.";
        setError(message);
        setState("error");
      }
    };

    fetchCenters();

    return () => controller.abort();
  }, []);

  /*
  // SERVER SEARCH: commented out for now - TODO: enable server-side search later
  useEffect(() => {
    const term = searchTerm.trim();
    if (!term) {
      // restore from cache
      setCenters(allCenters);
      return;
    }

    // For short terms < 2, prefer local filter to avoid too many requests
    if (term.length < 2) return;

    const controller = new AbortController();
    const handle = setTimeout(async () => {
      try {
        setState('loading');
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        const headers: HeadersInit = { 'Accept': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const response = await fetch(`/api/centers?q=${encodeURIComponent(term)}`, {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal,
          headers,
        });

        if (!response.ok) {
          return;
        }

        const data: BowlingCenter[] = await response.json();
        setCenters(data || []);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Server search failed', err);
      } finally {
        setState('loaded');
      }
    }, 450);

    return () => {
      controller.abort();
      clearTimeout(handle);
    };
  }, [searchTerm, allCenters]);
  */

  const filteredCenters = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return centers;

    return centers.filter((center) => {
      const haystack = [
        center.name,
        center.address_str,
        center.zipcode,
        center.admin || "",
        center.email || "",
        center.phone_number || "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [centers, searchTerm]);

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleCenterAdded = (newCenter: BowlingCenter) => {
    setCenters((prev) => [newCenter, ...prev]);
    setAllCenters((prev) => [newCenter, ...prev]);
  };

  const isLoading = state === "loading";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative overflow-hidden bg-linear-to-r from-[#8BC342] via-[#6fa332] to-[#8BC342] text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-2">
              {/* <p className="text-sm uppercase tracking-wide text-green-50">Pro Network</p> */}
              <h1 className="text-3xl md:text-4xl font-bold">Centers</h1>
              <p className="text-green-50 max-w-2xl">
                Explore bowling centers across the network, quickly search by name, ZIP, or admin contact, and drill into details on demand.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-green-100">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                  <Building2 className="w-4 h-4" />
                  <span>Total: {centers.length}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                  <Layers className="w-4 h-4" />
                  <span>Visible: {filteredCenters.length}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-green-700 rounded-lg hover:bg-green-50 transition-colors font-medium shadow-sm shrink-0"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden md:inline">Add Center</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search centers by name, address, ZIP, admin, email, phone"
                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm md:text-base"
              />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-sm font-medium text-green-700 hover:text-green-900 px-3 py-2 bg-green-50 rounded-lg"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-green-700">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading centers...</span>
            </div>
          </div>
        )}

        {state === "error" && !isLoading && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
            {error || "Unable to load centers right now."}
          </div>
        )}

        {!isLoading && state !== "error" && filteredCenters.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-600">
            No centers match your search.
          </div>
        )}

        <div className="space-y-3">
          {filteredCenters.map((center) => {
            const isExpanded = expandedId === center.id;
            return (
              <div
                key={center.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggleExpand(center.id)}
                  className="w-full text-left px-4 md:px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 flex items-center justify-center bg-gray-50 shrink-0">
                    <img
                      src={center.logo || FALLBACK_LOGO}
                      alt={center.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = FALLBACK_LOGO;
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-green-600" />
                          <h3 className="text-lg font-semibold text-gray-900 truncate">{center.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{center.address_str}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full">
                            <Layers className="w-3 h-3" />
                            {center.lanes} lanes
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">ZIP {center.zipcode}</span>
                          {center.admin && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full">Admin: {center.admin}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-green-700">
                        <span className="text-sm font-medium">{isExpanded ? "Hide" : "View"} details</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 md:px-6 pb-5">
                    <div className="border-t border-gray-100 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                      <div className="space-y-2">
                        <div className="font-semibold text-gray-900">Location</div>
                        <div className="flex items-start gap-2 text-gray-700">
                          <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
                          <span>{highlight(center.address_str)}</span>
                        </div>
                        <div className="flex items-start gap-2 text-gray-700">
                          <Compass className="w-4 h-4 text-green-600 mt-0.5" />
                          <span>Lat {center.lat}, Long {center.long}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="font-semibold text-gray-900">Contact</div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Phone className="w-4 h-4 text-green-600" />
                          <span>{highlight(center.phone_number)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail className="w-4 h-4 text-green-600" />
                          <span>{highlight(center.email)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Globe2 className="w-4 h-4 text-green-600" />
                          {center.website_url ? (
                            <a
                              href={center.website_url.startsWith("http") ? center.website_url : `https://${center.website_url}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-green-700 hover:text-green-900 underline"
                            >
                              Visit site
                            </a>
                          ) : (
                            <span>Website not provided</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="font-semibold text-gray-900">Metadata</div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Layers className="w-4 h-4 text-green-600" />
                          <span>{center.lanes} total lanes</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <LinkIcon className="w-4 h-4 text-green-600" />
                          <span>Center ID: {center.id}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Building2 className="w-4 h-4 text-green-600" />
                          <span>Admin: {center.admin || "Not assigned"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <AddCenterModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleCenterAdded}
      />
    </div>
  );
}
