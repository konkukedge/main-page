"use client";

import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Game, Review, fetchReviews, APPS_SCRIPT_URL } from '@/lib/googleSheet';

interface ReviewModalProps {
  game: Game;
  onClose: () => void;
}

const ReviewModal = ({ game, onClose }: ReviewModalProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewContent, setReviewContent] = useState('');

  const loadReviews = async () => {
    setIsLoading(true);
    const fetchedReviews = await fetchReviews(game.name);
    setReviews(fetchedReviews);
    setIsLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, [game]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewContent.trim()) {
      alert('이름과 후기 내용을 모두 입력해주세요.');
      return;
    }
    setIsSubmitting(true);

    const formData = {
      gameName: game.name,
      reviewerName: reviewerName,
      reviewContent: reviewContent,
    };

    try {
      // The original site uses 'no-cors' mode, which means we won't get a response.
      // We'll assume success if the request doesn't throw an error.
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
      });
      
      alert('후기가 성공적으로 등록되었습니다! 반영되기까지 시간이 걸릴 수 있습니다.');
      setReviewerName('');
      setReviewContent('');
      // Optimistically add the review to the list, or reload
      loadReviews();

    } catch (error) {
      console.error('Error submitting review:', error);
      alert('후기 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          className="bg-light-bg rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">{game.name} - 후기</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X />
            </button>
          </header>

          <div className="p-6 overflow-y-auto flex-grow">
            <h3 className="text-lg font-semibold mb-4">작성된 후기</h3>
            {isLoading ? (
              <p>후기를 불러오는 중...</p>
            ) : reviews.length === 0 ? (
              <p>아직 작성된 후기가 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <div key={index} className="bg-dark-bg p-3 rounded-lg">
                    <p className="font-semibold text-brand-green">{review.reviewerName}</p>
                    <p className="text-gray-300 whitespace-pre-wrap">{review.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <footer className="p-6 border-t border-gray-700">
            <h3 className="text-lg font-semibold mb-4">후기 남기기</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="이름"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full bg-dark-bg border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                />
              </div>
              <div className="mb-4">
                <textarea
                  placeholder="후기 내용"
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  rows={4}
                  className="w-full bg-dark-bg border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-green text-dark-bg font-bold py-2 px-4 rounded-lg hover:bg-brand-green/80 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? '등록 중...' : '후기 등록'}
              </button>
            </form>
          </footer>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReviewModal;
