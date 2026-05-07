export type OfferStatus =
  | 'pending' // awaiting your response
  | 'countered' // you countered, awaiting club response
  | 'accepted' // sale will execute / has executed
  | 'rejected' // you rejected
  | 'walked' // club walked away
  | 'expired'; // pending offer aged out (3 turns no response)

export type Offer = {
  id: string;
  playerId: string;
  clubId: string;
  amount: number;
  yourCounter?: number;
  status: OfferStatus;
  turnsRemaining: number; // pending / countered offers expire after 3 turns
  createdMonth: number;
  createdYear: number;
  // Buyer-perceived true value at offer creation. Stored so counter-response
  // logic doesn't re-roll the noise term.
  buyerPerceivedValue: number;
};

export type SaleEvent = {
  playerId: string;
  playerName: string;
  clubId: string;
  clubName: string;
  amount: number;
};
