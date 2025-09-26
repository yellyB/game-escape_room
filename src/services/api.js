import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// 캐릭터 목록을 가져오는 API
export const getCharacters = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/characters`);
    return response.data;
  } catch (error) {
    console.error('캐릭터 데이터를 가져오는 중 오류 발생:', error);
    throw error;
  }
};

// 대화 데이터를 가져오는 API
export const getDialogue = async ({ characterId, partNumber }) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/dialogue/${characterId}/part/${partNumber}`
    );
    return response.data;
  } catch (error) {
    console.error('대화 데이터를 가져오는 중 오류 발생:', error);
    throw error;
  }
};
