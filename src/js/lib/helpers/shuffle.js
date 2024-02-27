/**
 * Fisher-Yates shuffle. Shuffles the given array in place.
 * See https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 *
 * @param {*[]} array
 *  Values to shuffle
 * @return {*[]}
 *  Shuffled values
 */
function shuffle(array) {
  const answer = [...array];
  for (let i = answer.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [answer[i], answer[j]] = [answer[j], answer[i]];
  }
  return answer;
}

module.exports = shuffle;
