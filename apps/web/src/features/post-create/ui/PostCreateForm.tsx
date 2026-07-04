"use client";

import { useForm } from "react-hook-form";

import type { PostCreate } from "@/entities/post";

interface PostCreateFormProps {
  onSubmit: (data: PostCreate) => void;
  isPending?: boolean;
}

export function PostCreateForm({
  onSubmit,
  isPending = false,
}: PostCreateFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PostCreate>();

  return (
    <form
      onSubmit={handleSubmit((data) => {
        onSubmit(data);
        reset();
      })}
    >
      <div>
        <label htmlFor="post-title">제목</label>
        <input
          id="post-title"
          {...register("title", {
            required: "제목을 입력하세요",
            maxLength: 200,
          })}
        />
        {errors.title && <p role="alert">{errors.title.message}</p>}
      </div>
      <div>
        <label htmlFor="post-content">내용</label>
        <textarea
          id="post-content"
          {...register("content", { required: "내용을 입력하세요" })}
        />
        {errors.content && <p role="alert">{errors.content.message}</p>}
      </div>
      <button type="submit" disabled={isPending}>
        작성
      </button>
    </form>
  );
}
