import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useUser } from "@/contexts/UserContext";
import ModifierHUD from "@/components/ModifierHUD";
import { ModifierId } from "@/constants/Modifiers";

interface Card {
  id: number;
  value: string;
}

export default function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]); // indexes in the cards array
  const [matchedIds, setMatchedIds] = useState<number[]>([]);
  const { gainModifier, useModifier } = useUser();
  const [isRevealing, setIsRevealing] = useState(false);
  const [skipNextMismatch, setSkipNextMismatch] = useState(false);
  const { width } = useWindowDimensions();
  const numColumns = 4;
  const cardMargin = 8;
  const horizontalPadding = 16; // must match container style below
  const cardSize = Math.floor(
    (width - horizontalPadding * 2 - cardMargin * (numColumns + 1)) / numColumns
  );

  const generateDeck = (): Card[] => {
    const EMOJIS = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"];
    const duplicated = EMOJIS.concat(EMOJIS);
    return duplicated
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map((item, idx) => ({ id: idx, value: item.value }));
  };

  // Initialize cards on mount
  useEffect(() => {
    setCards(generateDeck());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetGame = () => {
    setFlipped([]);
    setMatchedIds([]);
    setSkipNextMismatch(false);
    setIsRevealing(false);
    setCards(generateDeck());
  };

  // Watch for win condition
  useEffect(() => {
    if (matchedIds.length > 0 && matchedIds.length === cards.length) {
      // Victory – restart after 2 seconds
      const timer = setTimeout(resetGame, 2000);
      return () => clearTimeout(timer);
    }
  }, [matchedIds, cards.length]);

  // No external modifiers fetch; inventory está no contexto do usuário

  const onCardPress = (index: number) => {
    if (
      flipped.length === 2 ||
      matchedIds.includes(cards[index].id) ||
      flipped.includes(index)
    ) {
      return;
    }
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];
      if (firstCard.value === secondCard.value) {
        setMatchedIds((prev) => [...prev, firstCard.id, secondCard.id]);
        awaitGain();
        // Clear flipped after a brief moment so the user sees the second flip
        setTimeout(() => setFlipped([]), 500);
      } else {
        if (skipNextMismatch) {
          setSkipNextMismatch(false);
          // Consider as matched!
          setMatchedIds((prev) => [...prev, firstCard.id, secondCard.id]);
          awaitGain();
          setTimeout(() => setFlipped([]), 500);
        } else {
          // Flip back after short delay
          setTimeout(() => setFlipped([]), 800);
        }
      }
    }
  };

  const awaitGain = () => {
    // Ganha modificador aleatório
    gainModifier().catch(() => {});
  };

  const handleUseModifier = async (mod: ModifierId) => {
    const success = await useModifier(mod);
    if (!success) return;
    switch (mod) {
      case "reveal":
        setIsRevealing(true);
        setTimeout(() => setIsRevealing(false), 1000);
        break;
      case "shuffle": {
        setCards((prev) => {
          const shuffled = [...prev]
            .map((card) => ({ ...card, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ sort, ...rest }) => rest);
          return shuffled;
        });
        break;
      }
      case "skip":
        setSkipNextMismatch(true);
        break;
    }
  };

  const renderItem = ({ item, index }: { item: Card; index: number }) => {
    const isFlipped =
      isRevealing || flipped.includes(index) || matchedIds.includes(item.id);
    return (
      <Pressable
        onPress={() => onCardPress(index)}
        style={[
          styles.card,
          { width: cardSize, height: cardSize },
          isFlipped && styles.flippedCard,
        ]}
      >
        <Text style={[styles.cardText, { fontSize: cardSize * 0.6 }]}>
          {isFlipped ? item.value : "❓"}
        </Text>
      </Pressable>
    );
  };

  const hasWon = matchedIds.length === cards.length && cards.length > 0;

  return (
    <View style={styles.container}>
      {hasWon && <Text style={styles.winText}>🎉 Você venceu! 🎉</Text>}
      <FlatList
        data={cards}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        numColumns={numColumns}
        scrollEnabled={false}
      />
      <ModifierHUD onUse={handleUseModifier} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 8,
    paddingVertical: 140,
  },
  card: {
    margin: 4,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2f95dc",
  },
  flippedCard: {
    backgroundColor: "#fff",
  },
  cardText: {
    fontWeight: "900",
  },
  winText: {
    fontSize: 32,
    fontWeight: "bold",
  },
});
