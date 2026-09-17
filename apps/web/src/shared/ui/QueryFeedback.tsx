"use client";

type Props = {
  label: string;
  query: {
    isError: boolean;
    isFetching: boolean;
    refetch: () => Promise<unknown>;
  };
};

export function QueryFeedback({ label, query }: Props) {
  return (
    <div
      className="text-muted px-4 py-8 text-[12.5px] sm:px-12"
      role={query.isError ? "alert" : "status"}
    >
      <p>
        {query.isError
          ? `${label}를 불러오지 못했습니다.`
          : `${label}를 불러오는 중입니다…`}
      </p>
      {query.isError && (
        <button
          type="button"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
          className="text-sea mt-3 min-h-11 underline disabled:opacity-50"
        >
          {query.isFetching ? "다시 불러오는 중…" : "다시 시도"}
        </button>
      )}
    </div>
  );
}
