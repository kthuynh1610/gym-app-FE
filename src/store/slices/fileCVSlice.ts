// store/slices/suggestionSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SuggestionState {
    fileName: string;
    suggestions: string;
    message: string;
    data: any; // optionally refine this type
}

const initialState: SuggestionState = {
    fileName: '',
    suggestions: '',
    message: '',
    data: null,
};

const suggestionSlice = createSlice({
    name: 'suggestion',
    initialState,
    reducers: {
        setSuggestion: (state, action: PayloadAction<SuggestionState>) => {
            return action.payload;
        },
        updateSuggestions: (state, action: PayloadAction<string>) => {
            state.suggestions = action.payload;
        },
    },
});

export const { setSuggestion, updateSuggestions } = suggestionSlice.actions;
export default suggestionSlice.reducer;
