import { useState, useCallback } from 'react';
import firefliesService, { 
  FirefliesTranscriptionRequest, 
  FirefliesTranscriptionResponse 
} from '../services/firefliesService';

interface UseFirefliesState {
  isTranscribing: boolean;
  progress: string;
  result: FirefliesTranscriptionResponse | null;
  error: string | null;
}

export const useFireflies = () => {
  const [state, setState] = useState<UseFirefliesState>({
    isTranscribing: false,
    progress: '',
    result: null,
    error: null,
  });

  const transcribeAudio = useCallback(async (request: FirefliesTranscriptionRequest) => {
    setState({
      isTranscribing: true,
      progress: 'Retrieving existing transcription...',
      result: null,
      error: null,
    });

    try {
      // Get existing transcription from Fireflies URL
      const result = await firefliesService.getExistingTranscription(request);
      console.log('Fireflies transcription retrieved:', result);

      setState({
        isTranscribing: false,
        progress: 'Transcription retrieved!',
        result,
        error: null,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Failed to get Fireflies transcription:', errorMessage);

      setState({
        isTranscribing: false,
        progress: '',
        result: null,
        error: errorMessage,
      });

      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isTranscribing: false,
      progress: '',
      result: null,
      error: null,
    });
  }, []);

  return {
    transcribeAudio,
    reset,
    ...state,
  };
}; 