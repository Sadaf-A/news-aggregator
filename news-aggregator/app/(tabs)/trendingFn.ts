export const updateNewsLikes = (news: any[], itemId: string) => {
    return news.map(newsItem =>
      newsItem._id === itemId ? { ...newsItem, likes: newsItem.likes + 1 } : newsItem
    );
  };
  
  export const updateNewsComments = (news: any[], itemId: string, comment: string) => {
    return news.map(newsItem =>
      newsItem._id === itemId ? { ...newsItem, comments: [...newsItem.comments, comment] } : newsItem
    );
  };
  
  export const updateNewsRating = (news: any[], itemId: string, rating: number) => {
    return news.map(newsItem =>
      newsItem._id === itemId ? { ...newsItem, rating } : newsItem
    );
  };
  