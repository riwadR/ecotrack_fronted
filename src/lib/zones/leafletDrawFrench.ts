import L from "leaflet";
import "leaflet-draw";

/**
 * Applies French UI strings to Leaflet.draw without replacing nested handler objects
 * (shallow assign would drop required keys like `polyline.error` and crash the toolbar).
 */
export function configureLeafletDrawFrench(): void {
  const local = L.drawLocal as {
    draw: {
      toolbar: {
        actions: { title: string; text: string };
        finish: { title: string; text: string };
        undo: { title: string; text: string };
        buttons: Record<string, string>;
      };
      handlers: {
        polyline: { error: string; tooltip: { start: string; cont: string; end: string } };
        polygon: { tooltip: { start: string; cont: string; end: string } };
        rectangle: { tooltip: { start: string } };
        circle: { tooltip: { start: string }; radius: string };
        marker: { tooltip: { start: string } };
        circlemarker: { tooltip: { start: string } };
        simpleshape: { tooltip: { end: string } };
      };
    };
    edit: {
      toolbar: {
        actions: {
          save: { title: string; text: string };
          cancel: { title: string; text: string };
          clearAll: { title: string; text: string };
        };
        buttons: Record<string, string>;
      };
      handlers: {
        edit: { tooltip: { text: string; subtext: string } };
        remove: { tooltip: { text: string } };
      };
    };
  };

  const { toolbar: drawToolbar, handlers: drawHandlers } = local.draw;
  drawToolbar.actions.title = "Annuler le dessin";
  drawToolbar.actions.text = "Annuler";
  drawToolbar.finish.title = "Terminer le contour";
  drawToolbar.finish.text = "Terminer";
  drawToolbar.undo.title = "Retirer le dernier sommet";
  drawToolbar.undo.text = "Retirer le dernier point";
  drawToolbar.buttons.polygon = "Dessiner un secteur";
  drawToolbar.buttons.polyline = "Tracer une ligne";
  drawToolbar.buttons.rectangle = "Dessiner un rectangle";
  drawToolbar.buttons.circle = "Dessiner un cercle";
  drawToolbar.buttons.marker = "Placer un marqueur";
  drawToolbar.buttons.circlemarker = "Placer un marqueur circulaire";

  drawHandlers.polyline.error =
    "<strong>Erreur :</strong> les bords du polygone ne peuvent pas se croiser.";
  drawHandlers.polyline.tooltip.start = "Placez le premier point de la ligne sur la carte.";
  drawHandlers.polyline.tooltip.cont = "Ajoutez un point pour poursuivre la ligne.";
  drawHandlers.polyline.tooltip.end = "Repassez sur le dernier point pour terminer.";

  drawHandlers.polygon.tooltip.start = "Placez le premier sommet du secteur.";
  drawHandlers.polygon.tooltip.cont = "Ajoutez un sommet au contour.";
  drawHandlers.polygon.tooltip.end = "Refermez sur le premier point pour terminer le secteur.";

  drawHandlers.rectangle.tooltip.start =
    "Délimitez un rectangle : enfoncez, faites glisser, puis relâchez sur la carte.";
  drawHandlers.circle.tooltip.start =
    "Délimitez un cercle : enfoncez, faites glisser pour le rayon, puis relâchez.";
  drawHandlers.circle.radius = "Rayon";
  drawHandlers.marker.tooltip.start = "Indiquez l’emplacement du marqueur sur la carte.";
  drawHandlers.circlemarker.tooltip.start = "Indiquez l’emplacement du marqueur sur la carte.";
  drawHandlers.simpleshape.tooltip.end = "Relâchez pour terminer.";

  const { toolbar: editToolbar, handlers: editHandlers } = local.edit;
  editToolbar.actions.save.title = "Enregistrer les modifications";
  editToolbar.actions.save.text = "Enregistrer";
  editToolbar.actions.cancel.title = "Annuler les modifications";
  editToolbar.actions.cancel.text = "Annuler";
  editToolbar.actions.clearAll.title = "Tout effacer";
  editToolbar.actions.clearAll.text = "Tout effacer";
  editToolbar.buttons.edit = "Modifier les contours";
  editToolbar.buttons.editDisabled = "Aucun secteur à modifier";
  editToolbar.buttons.remove = "Supprimer un secteur";
  editToolbar.buttons.removeDisabled = "Aucun secteur à supprimer";

  editHandlers.edit.tooltip.text =
    "Déplacez les sommets ou faites glisser le secteur pour ajuster le tracé.";
  editHandlers.edit.tooltip.subtext = "Validez avec « Enregistrer ».";
  editHandlers.remove.tooltip.text = "Sélectionnez un secteur sur la carte pour le retirer.";
}
