import { useEffect, useMemo, useState } from 'react';
import { chapters } from '../../data/gameFlow';

export default function MonologueManager() {
  const [characters, setCharacters] = useState([]);

  const [currFlow, setCurrFlow] = useState({ id: 'opening', index: 0 });
  const [isMonologueOpen, setIsMonologueOpen] = useState(false);

  const currStep = useMemo(() => {
    return chapters[currFlow.id][currFlow.index];
  }, [currFlow]);

  const moveNextStep = () => {
    setCurrFlow(currStep.next);
  };

  const startMonologue = () => {
    setIsMonologueOpen(true);
  };

  const startChatFromOpponent = () => {};

  const startChatFromMe = () => {};

  const runFlow = () => {
    if (!currFlow) return;
    if (currFlow.type === 'monologue') {
      startMonologue();
    } else if (currFlow.type === 'chatFromOpponent') {
      startChatFromOpponent();
    } else if (currFlow.type === 'chatFromMe') {
      startChatFromMe();
    }
  };

  useEffect(() => {
    console.log('----:', currStep);
  }, [currStep]);

  return {
    currFlow, // todo: 필요가 있나?
    currStep,
    isMonologueOpen,
    setCurrFlow,
    setCharacters,
    runFlow,
    moveNextStep,
  };
}
