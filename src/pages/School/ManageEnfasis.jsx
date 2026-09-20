import ManageAsignatureEnfasis from "./ManageAsignatureEnfasis";

const ManageEnfasis = () => {
  return (
    <div className="p-6 h-full gap-4 flex flex-col">
      <div
        id="tour-me-header"
        className="w-full grid gap-2 grid-cols-1 lg:grid-cols-5 xl:grid-cols-4 justify-between items-center bg-primary text-surface p-3 rounded-lg"
      >
        <div className="lg:col-span-3 xl:col-span-2 flex items-center">
          <h2 className="text-2xl font-bold">Gestión de Énfasis</h2>
        </div>
      </div>

      <ManageAsignatureEnfasis />
    </div>
  );
};

export default ManageEnfasis;