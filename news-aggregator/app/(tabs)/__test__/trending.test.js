import { updateNewsLikes, updateNewsComments, updateNewsRating } from '../trendingFn';

const sampleNews = [
  { _id: '1', title: 'News 1', likes: 10, comments: [], rating: 3 },
  { _id: '2', title: 'News 2', likes: 5, comments: [], rating: 4 },
];

describe('News Utilities', () => {
  test('updateNewsLikes should increment likes for the given news item', () => {
    const updatedNews = updateNewsLikes(sampleNews, '1');
    expect(updatedNews.find(item => item._id === '1')?.likes).toBe(11);
  });

  test('updateNewsComments should add a new comment to the specified news item', () => {
    const updatedNews = updateNewsComments(sampleNews, '2', 'Nice article!');
    expect(updatedNews.find(item => item._id === '2')?.comments).toContain('Nice article!');
  });

  test('updateNewsRating should update the rating for the given news item', () => {
    const updatedNews = updateNewsRating(sampleNews, '1', 5);
    expect(updatedNews.find(item => item._id === '1')?.rating).toBe(5);
  });
});
