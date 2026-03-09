import React, { useState, useEffect } from "react";
import { FaStar, FaUser } from "react-icons/fa";
import Button from "@/common/Button";
import Modal from "@/common/Modal";
import CustomInput from "@/common/FormElements/CustomInput";
import { format } from "date-fns";
import apiClient from "@/utils/apiClient";
import FileInput from "@/common/FileInput";
import { useSession } from "next-auth/react";

interface Review {
  id: number;
  rating: number;
  headline: string;
  comment: string;
  media: string[];
  createdAt: string;
  user: {
    name: string;
  };
}

interface ReviewSectionProps {
  type: "property" | "homeDecor" | "homedecor" | "furniture" | "electronics";
  id: string | number;
}

export default function ReviewSection({ type, id }: ReviewSectionProps) {
  const [openModal, setOpenModal] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<number[]>([]);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [newHeadline, setNewHeadline] = useState("");
  const [reviewImages, setReviewImages] = useState<string[]>([]);

  const [user, setUser] = useState<any>();

  const { data: session, status } = useSession();

  useEffect(() => {
    const handleUserSession = async () => {
      if (status === "loading") {
        return;
      }
      if (status === "authenticated" && session?.user) {
        setUser(session.user);
      }
    };
    handleUserSession();
  }, [status]);


  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await apiClient.get(`${apiClient.URLS.reviews}/${type}/${id}`);
        const reviewsData = response.body.reviews;

        setReviews(reviewsData);

        const total = reviewsData.reduce((acc: number, curr: Review) => acc + curr.rating, 0);
        setAverageRating(total / reviewsData.length || 0);

        const distribution = [0, 0, 0, 0, 0];
        reviewsData.forEach((review: Review) => {
          const index = Math.floor(review.rating) - 1;
          distribution[index >= 5 ? 4 : index]++;
        });
        setRatingDistribution(distribution);
      } catch (error: any) {
        if (error.status === 404) {
          return;
        }
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, [type, id]);

  const handleSubmitReview = async () => {
    try {
      const response = await apiClient.post(`${apiClient.URLS.reviews}/${user.id}/${type}/${id}`, {
        rating: newRating,
        comments: newComment,
        headline: newHeadline,
        media: [],
      });
      setReviews([...reviews, response.data]);
      setOpenModal(false);
      setNewRating(0);
      setNewComment("");
      setNewHeadline("");
      setReviewImages([]);
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const calculatePercentage = (count: number) => {
    const total = reviews.length;
    return total > 0 ? ((count / total) * 100).toFixed(0) + "%" : "0%";
  };

  return (
    <div className="flex flex-col md:flex-row items-start gap-8 mx-auto p-4">
      {/* Left Section */}
      <div className="flex-1 max-w-2xl w-full ">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Customer reviews</h1>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, index) => (
                <FaStar
                  key={index}
                  className={`text-2xl ${index < averageRating
                    ? "text-[#FFAE27]"
                    : "text-gray-300"
                    }`}
                />
              ))}
            </div>
            <span className="font-medium">
              {averageRating.toFixed(1)} out of 5
            </span>
          </div>
        </div>

        <div className="space-y-4 mb-8 w-full">
          {[5, 4, 3, 2, 1].map((rating, index) => (
            <div key={rating} className="flex items-center gap-4">
              <span className="w-16">{rating} star</span>
              <div className="flex-1 h-4 bg-gray-200 rounded w-full max-w-[300px]">
                <div
                  className="h-full bg-[#F8B84E] rounded"
                  style={{ width: calculatePercentage(ratingDistribution[index]) }}
                />
              </div>
              <span className="w-12">{calculatePercentage(ratingDistribution[index])}</span>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <Button className="bg-[#5297FF] hover:bg-blue-700 font-medium btn-txt text-white  py-2 md:px-5 px-3 rounded-md cursor-pointer" onClick={() => setOpenModal(true)} variant="outline">
            Write Your Review
          </Button>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1 w-full">
        <h2 className="text-2xl font-bold mb-4">Top Reviews</h2>

        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, index) => (
                    <FaStar
                      key={index}
                      className={`text-sm ${index < review.rating
                        ? "text-[#FFAE27]"
                        : "text-gray-300"
                        }`}
                    />
                  ))}
                </div>
                <span className="font-medium">{review.user?.name || "Anonymous"}</span>
              </div>
              <p className="text-gray-600">{review.comment}</p>
              <span className="text-sm text-gray-500">
                {format(new Date(review.createdAt), "MMM dd, yyyy")}
              </span>
            </div>
          ))}

          {reviews.length === 0 && (
            <p className="text-gray-500">No reviews yet. Be the first to write one!</p>
          )}
        </div>
      </div>

      {openModal && (
        <Modal
          isOpen={openModal}
          closeModal={() => setOpenModal(false)}
          className="max-w-[1296px] min-h-full"
        >
          <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold">Create Your Review</h2>

            <div>
              <label className="block mb-2">Rating</label>
              <div className="flex gap-1">
                {[...Array(5)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setNewRating(index + 1)}
                    className={`text-2xl ${index < newRating
                      ? "text-[#FFAE27]"
                      : "text-gray-300"
                      }`}
                  >
                    <FaStar />
                  </button>
                ))}
              </div>
            </div>

            <CustomInput
              label="Headline"
              name="headline"
              type="text"
              value={newHeadline}
              onChange={(e) => setNewHeadline(e.target.value)}
            />

            <CustomInput
              label="Review"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              name="review"
              type="textarea"
              rows={4}
            />

            {/* TODO: Make a working model of file input, have to send image urls to backend */}
            <FileInput
              name="review images"
              type="file"
              label="Add a photo & Video"
              sublabel="Drag and drop files or Upload"
              folderName="furniturereviews"
            />

            <Button className="bg-[#5297FF] hover:bg-blue-700 text-white px-3 md:px-5 font-medium btn-txt py-2 rounded-md cursor-pointer" onClick={handleSubmitReview}>Submit Review</Button>
          </div>
        </Modal>
      )}


    </div>
  );
}