import "./Landing/landing.css";
import Header from "./Landing/components/Header";
import Hero from "./Landing/components/Hero";
import TodoConectado from "./Landing/components/TodoConectado";
import QuienesSomos from "./Landing/components/QuienesSomos";
import Perfiles from "./Landing/components/Perfiles";
import Modulos from "./Landing/components/Modulos";
import ComoFunciona from "./Landing/components/ComoFunciona";
import Galeria from "./Landing/components/Galeria";
import Recursos from "./Landing/components/Recursos";
import FAQ from "./Landing/components/FAQ";
import Seguridad from "./Landing/components/Seguridad";
import Contacto from "./Landing/components/Contacto";
import Footer from "./Landing/components/Footer";

export default function LandingPage() {
  return (
    <div className="nexus-landing w-full bg-white font-sans text-slate-900">
      <Header />
      <main>
        <Hero />
        <QuienesSomos />
        <TodoConectado />
        <Perfiles />
        <Modulos />
        <ComoFunciona />
        <Galeria />
        <Recursos />
        <FAQ />
        <Seguridad />
        <Contacto />
      </main>
      <Footer />
    </div>
  );
}
