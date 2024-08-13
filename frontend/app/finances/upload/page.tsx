import Dropzone from "./Dropzone";

const UploadPage = () => {
  return (
    <div className="flex flex-col h-screen w-full items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">Upload Page</h1>
      <Dropzone />
    </div>
  );
};

export default UploadPage;
