export interface NewsSource {
    id?: string;
    name: string;
  }
  
  export interface NewsItem {
    id: string;
    source?: NewsSource;
    author?: string;
    title: string;
    description: string;
    url?: string;
    urlToImage?: string;
    publishedAt?: string;
    content?: string;
    likeCount: number;
    feedback: Array<{
      userId: string;
      comment: string;
    }>;
  }