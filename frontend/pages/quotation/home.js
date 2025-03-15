"use client";
import { useState } from "react";
import { useRouter } from "next/router";
import { FaPlus, FaEye } from "react-icons/fa";
import { motion } from "framer-motion";
import StarryBackground from "@/components/StarryBackground";
import BackButton from "@/components/BackButton";

export default function Home() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCard, setActiveCard] = useState(null);


  const inventoryCards = [
          { 
            id: 1, 
            title: "Generate Quote", 
            Icon: FaPlus, 
            colors: ["#1e40af", "#3b82f6", "#93c5fd", "#3b82f6", "#1e40af"], // Dark → Light → Dark
            route: "/quotation/QuoteManager", 
            image: "https://www.pngmart.com/files/8/Inventory-PNG-HD.png" 
          },
        
          { 
            id: 2, 
            title: "View Quote", 
            Icon: FaEye, 
            colors: ["#065f46", "#10b981", "#6ee7b7", "#10b981", "#065f46"], // Dark → Light → Dark
            route: "/quotation/QuoteList", 
            image: "https://png.pngtree.com/png-clipart/20230825/original/pngtree-inventory-control-vector-warehouse-industry-picture-image_8773876.png" 
             
      
          }
        ];

  return (
    <div className="flex flex-col min-h-screen text-white pt-16">
      <StarryBackground/>
      <BackButton route="/dashboard"/>
      {/* Main Content */}
      <div className="flex flex-col items-center flex-grow p-6 pt-20">
        <h1 className="text-4xl font-bold mb-12 text-center pb-4">Quote Management System</h1>

        {/* Accordion-Style Cards */}
        <div className="w-full max-w-7xl px-4 text-black">
          <motion.div
            className="flex gap-4 h-[500px]"
            animate={{
              marginRight: isMenuOpen ? "16rem" : "0",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {inventoryCards.map((card) => (
              <motion.div
                key={card.id}
                className="relative rounded-2xl overflow-hidden cursor-pointer shadow-xl"
                initial={{ flex: 0.7 }}
                animate={{ 
                  flex: activeCard === card.id ? 2 : 0.7,
                  scale: activeCard === card.id ? 1.03 : 1 
                }}
                onHoverStart={() => setActiveCard(card.id)}
                onHoverEnd={() => setActiveCard(null)}
                onClick={() => router.push(card.route)}
                transition={{ 
                  type: "spring", 
                  stiffness: 260,
                  damping: 20
                }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(45deg, ${card.colors.join(', ')})`,
                    backgroundSize: "400% 400%"
                  }}
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />

                <motion.div 
                  className="absolute inset-0 bg-black/20 transition-all duration-300"
                  style={{ 
                    backgroundImage: `url(${card.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}
                  animate={{
                    opacity: activeCard === card.id ? 1 : 0
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                  <motion.h2 
                    className="text-2xl font-bold text-center whitespace-nowrap"
                    animate={{ 
                      fontSize: activeCard === card.id ? "2rem" : "1.5rem",
                      marginBottom: activeCard === card.id ? "1.5rem" : "1rem",
                      rotate: activeCard === card.id ? 0 : -90,
                      transformOrigin: "center"
                    }}
                  >
                    {card.title}
                  </motion.h2>
                  <motion.div
                    animate={{
                      opacity: activeCard === card.id ? 1 : 0
                    }}
                  >
                    <card.Icon className="text-4xl mb-4" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full backdrop-blur-sm text-white py-4 text-center mt-auto">
        <p className="text-sm">© {new Date().getFullYear()} Quote Management</p>
      </footer>
    </div>
  );
}