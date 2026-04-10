import { TrelloCard } from '../types';

export const mockTrelloQueue: TrelloCard[] = [
  {
    id: 'trello-1',
    title: 'Login Error Validation',
    description: 'Ensure that users cannot log in with invalid email formats. An inline error saying "Invalid email format" must appear below the input field.',
    status: 'Pending AI',
  },
  {
    id: 'trello-2',
    title: 'Empty Cart Checkout Prevention',
    description: 'If a user navigates to the cart page and there are 0 items, the "Proceed to Checkout" button must be strictly disabled.',
    status: 'Pending AI',
  },
  {
    id: 'trello-3',
    title: 'Profile Picture Upload Format',
    description: 'Users should only be able to upload .jpg and .png files for their avatar. Other formats should throw an alert.',
    status: 'Ready for Execution',
  }
];