import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, Search, Zap, FolderOpen, Target, CheckCircle, Clock, Lightbulb, Star } from "lucide-react";
import { TestimonialSlider } from "@/components/ui/testimonial-slider";
import { Footer } from "@/components/ui/footer";
import { InteractivePromptCards } from "@/components/InteractivePromptCards";

export default function PromptManagementLanding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleSignIn = () => {
    navigate('/build');
  };

  const testimonials = [
    {
      img: "https://randomuser.me/api/portraits/women/25.jpg",
      quote: "Fini le chaos ! Mes prompts sont enfin organisés et je ne perds plus d'idées brillantes. Ma productivité a doublé.",
      name: "Marie",
      role: "Développeuse Full-Stack"
    },
    {
      img: "https://randomuser.me/api/portraits/men/42.jpg",
      quote: "Avant, je perdais des heures à chercher mes anciens prompts dans mes notes. Maintenant, tout est centralisé et instantané.",
      name: "Thomas",
      role: "Tech Lead"
    },
    {
      img: "https://randomuser.me/api/portraits/women/33.jpg",
      quote: "La capture instantanée change tout. Mes meilleures idées arrivent toujours au mauvais moment, maintenant elles sont sauvées.",
      name: "Sophie",
      role: "Product Manager"
    },
    {
      img: "https://randomuser.me/api/portraits/men/28.jpg",
      quote: "Plus besoin de jongler entre 10 onglets et documents. Tout est là, organisé, prêt à l'emploi.",
      name: "Julien",
      role: "Indie Hacker"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-3 sm:px-6 pb-16 sm:pb-20 pt-12 sm:pt-16 md:pt-24">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              <span className="text-primary">Enfin plus de clarté</span>
              <br />
              dans vos prompts AI
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
              Transformez le chaos de vos idées en système organisé et productif
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Button size="lg" onClick={handleSignIn} className="px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-medium group w-full sm:w-auto">
              {user ? "Commencer" : "Essayer Gratuitement"}
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-6 opacity-60">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Organisation instantanée</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>Capture ultra-rapide</span>
            </div>
          </div>
        </div>
      </main>

      {/* Instant Note-Taking Section */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                <span className="text-primary">Notez vos prompts</span>
                <br />
                instantanément
              </h2>
               
               <p className="text-xl text-muted-foreground">
                 Vos meilleures idées arrivent toujours au mauvais moment. Capturez-les en 2 secondes, organisez-les automatiquement.
               </p>
                
               <div className="space-y-3">
                 <div className="flex items-center gap-3">
                   <Lightbulb className="w-5 h-5 text-primary" />
                   <span><strong>Capture d'idée éclair</strong> - En 2 secondes chrono</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <Zap className="w-5 h-5 text-primary" />
                   <span><strong>Raccourcis clavier</strong> - Sans quitter votre IDE</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <Target className="w-5 h-5 text-primary" />
                   <span><strong>Contexte automatique</strong> - Plus de prompts vagues</span>
                 </div>
               </div>
                 
               <Button size="lg" onClick={handleSignIn} className="px-8 py-6 text-lg font-medium group">
                 {user ? "Commencer" : "Tester la Capture"}
                 <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
               </Button>
             </div>
             
              <div className="flex items-center justify-center min-h-[600px]">
                <InteractivePromptCards />
              </div>
           </div>
         </div>
       </section>

      {/* Organization & Productivity Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-background rounded-2xl p-8 space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Organisation Intelligente</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <FolderOpen className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Auto-catégorisation</div>
                      <div className="text-sm text-muted-foreground">Par projet, épique, priorité</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Search className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Recherche instantanée</div>
                      <div className="text-sm text-muted-foreground">Trouvez n'importe quel prompt</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Historique complet</div>
                      <div className="text-sm text-muted-foreground">Versions et modifications</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                <span className="text-primary">Restez organisé</span>
                <br />
                et productif
              </h2>
              
              <p className="text-muted-foreground text-lg">
                Transformez votre chaos créatif en système ultra-productif. Fini les prompts perdus dans Google Docs.
              </p>

              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Temps économisé par semaine</span>
                    <span className="text-2xl font-bold text-primary">5h+</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Plus de recherche dans vos documents</div>
                </div>
                
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Idées capturées</span>
                    <span className="text-2xl font-bold text-primary">100%</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Zéro perte créative</div>
                </div>
              </div>
                
              <Button size="lg" onClick={handleSignIn} className="px-8 py-6 text-lg font-medium group">
                {user ? "Commencer" : "Booster ma Productivité"}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Centralization Section */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-6 sm:space-y-8 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="text-primary">Centralisez</span> toutes vos tâches AI
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Un seul endroit pour tous vos prompts, idées, et tâches de développement. Fini le chaos multi-plateformes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 p-6 rounded-2xl bg-muted/30">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <FolderOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Projets Unifiés</h3>
              <p className="text-muted-foreground">
                Tous vos projets, épiques et prompts dans un workspace cohérent
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-2xl bg-muted/30">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Base de Connaissances</h3>
              <p className="text-muted-foreground">
                Docs, liens, snippets - tout le contexte nécessaire centralisé
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-2xl bg-muted/30">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Export Universel</h3>
              <p className="text-muted-foreground">
                Compatible avec tous vos outils : Cursor, Claude, ChatGPT...
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" onClick={handleSignIn} className="px-8 py-6 text-lg font-medium group">
              {user ? "Commencer" : "Centraliser Maintenant"}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section aria-labelledby="testimonials-heading" className="py-16 bg-background/50">
        <h3 id="testimonials-heading" className="sr-only">Témoignages</h3>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Ce que disent nos utilisateurs</h2>
            <p className="text-muted-foreground">Développeurs qui ont transformé leur workflow</p>
          </div>
          <TestimonialSlider testimonials={testimonials} />
        </div>
      </section>

      {/* Footer */}
      <Footer
        logo="🚀"
        brandName="Ahead.love"
        mainLinks={[
          { href: "/", label: "Accueil" },
          { href: "/prompt-management", label: "Gestion Prompts" },
          { href: "/pricing", label: "Tarifs" },
        ]}
        legalLinks={[
          { href: "#", label: "Politique de confidentialité" },
          { href: "#", label: "Conditions d'utilisation" },
        ]}
        copyright={{
          text: `© ${new Date().getFullYear()} Ahead.love. Tous droits réservés.`
        }}
      />
    </div>
  );
}