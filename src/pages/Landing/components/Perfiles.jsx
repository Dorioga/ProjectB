import { profilesData } from "../data";
import { Icon } from "./Icons";
import { DarkCard } from "./ui";

function Perfiles() {
  return (
    <section id="perfiles" className="bg-bg py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-10">
          <span className="text-secondary font-bold text-xs tracking-widest uppercase mb-3 block">
            Roles
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary mb-4">
            Un espacio diseñado para cada usuario.
          </h2>
          <p className="text-muted text-base sm:text-lg max-w-xl mx-auto">
            Cada perfil accede únicamente a las herramientas que necesita.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {profilesData.map(({ icon, title, features }) => (
            <DarkCard key={title} icon={icon} title={title}>
              <ul className="space-y-1.5 mt-1">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-secondary shrink-0">
                      <Icon.Check />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </DarkCard>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Perfiles;
