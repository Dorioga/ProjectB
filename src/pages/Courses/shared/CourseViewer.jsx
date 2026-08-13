import CoursePanel from "./CoursePanel";
import CourseScene from "./CourseScene";
import "./course.css";

export default function CourseViewer({
  title,
  backTo = "/dashboard/courses",
  panel,
  children,
  overlays,
  camera = [0, 2, 2.5],
  fov = 60,
  controls = {},
  gizmo = false,
  ground = false,
  panelWidth,
  open,
  onOpenChange,
  desktopOpen,
  onDesktopOpenChange,
}) {
  return (
    <div className="h-full w-full relative courses-scene">
      <CoursePanel
        title={title}
        backTo={backTo}
        width={panelWidth}
        open={open}
        onOpenChange={onOpenChange}
        desktopOpen={desktopOpen}
        onDesktopOpenChange={onDesktopOpenChange}
      >
        {panel}
      </CoursePanel>

      <CourseScene
        camera={camera}
        fov={fov}
        controls={controls}
        gizmo={gizmo}
        ground={ground}
      >
        {children}
      </CourseScene>

      {overlays}
    </div>
  );
}