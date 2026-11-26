/** A founding member of a clan. */
export interface ClanFounder {
  name: string;
  role: string;
}

/** Values of the clan creation form. */
export interface ClanCreationValues {
  /** The clan's name. */
  name: string;
  /** One line describing the clan. */
  description: string;
  /** Rules new members must follow — one entry per rule. */
  rules: string[];
  /** How applicants can reach the clan. */
  contact: {
    email: string;
    phone: string;
  };
  /** The clan's founders. */
  founders: ClanFounder[];
}
