'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { ChevronLeft, Loader2 } from 'lucide-react';

interface MyCard {
  metadata: {
    card_id: number;
    user_id: number;
    design: {
      design_id: number;
      name: string;
      code_name: string;
    };
    is_followable: boolean;
    is_collected_by_viewer: boolean;
    is_followed_by_viewer: boolean;
    collections_count: number;
    is_ready: boolean;
    created: string;
  };
  card_html_url: string;
}

export default function MyCardsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [myCards, setMyCards] = useState<MyCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCards = async () => {
      if (user) {
        try {
          setLoading(true);
          const response = await api.get<MyCard[]>('/api/cards');
          setMyCards(response.data);
        } catch (error) {
          console.error('Error fetching my cards:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMyCards();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">My Created Cards</h1>
        <p className="mt-1 text-sm text-gray-600">Here are all the cards you have created.</p>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 place-items-center">
            {myCards.length > 0 ? (
              myCards.map((card) => (
                <div
                  key={card.metadata.card_id}
                  className="relative w-[320px] h-[450px]"
                >
                  <iframe
                    title={`Card ${card.metadata.card_id}`}
                    src={card.card_html_url}
                    className="h-full w-full rounded-xl shadow-2xl border-0"
                    sandbox="allow-scripts allow-same-origin"
                    scrolling="no"
                  ></iframe>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500">
                You haven&apos;t created any cards yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
