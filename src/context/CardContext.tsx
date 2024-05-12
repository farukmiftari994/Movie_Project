import { createContext, useState, ReactNode, useContext } from "react";
import { Okej } from "../@types";
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../pages/firebase";
import { AuthContext } from "./AuthContext";

interface CardContextType {
  addToFavourites: (populars: Okej) => Promise<void>;
  removeFromFavourites: (populars: Okej) => Promise<void>;
  items: Okej[];
}

const CardContext = createContext<CardContextType>({} as CardContextType);

export function CardProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Okej[]>([]);
  const { user } = useContext(AuthContext);
  const addToFavourites = async (populars: Okej) => {
    if (!user) {
      return;
    }
    try {
      setItems((prevState) => [...prevState, populars]);
      const title = populars.title ? populars.title : populars.name;
      const docRef = doc(
        db,
        "favourites",
        user.email + "",
        "movies",
        title + ""
      );
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, {
          id: populars.id,
          title: title,
          poster_path: populars.poster_path,
          vote_average: populars.vote_average,
        });
      } else {
        const title = populars.title ? populars.title : populars.name;

        await setDoc(docRef, {
          id: populars.id,
          title: title,
          poster_path: populars.poster_path,
          vote_average: populars.vote_average,
        });
      }
    } catch (error) {
      console.error("Error removing from favourites:", error);
    }
  };

  const removeFromFavourites = async (populars: Okej) => {
    try {
      if (!user) {
        return;
      }
      setItems((prevState) => prevState.filter((item) => item !== populars));
      const title = populars.title ? populars.title : populars.name;
      const docRef = doc(
        db,
        "favourites",
        user.email + "",
        "movies",
        title + ""
      );
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error removing from favourites:", error);
    }
  };

  return (
    <CardContext.Provider
      value={{
        items,
        addToFavourites,
        removeFromFavourites,
      }}
    >
      {children}
    </CardContext.Provider>
  );
}

export default CardContext;
