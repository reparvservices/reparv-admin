import { lazy, Suspense } from "react";

const CKEditorInner = lazy(async () => {
  const [{ CKEditor }, { default: ClassicEditor }] = await Promise.all([
    import("@ckeditor/ckeditor5-react"),
    import("@ckeditor/ckeditor5-build-classic"),
  ]);
  return {
    default: function Editor(props) {
      return <CKEditor {...props} editor={ClassicEditor} />;
    },
  };
});

export default function LazyCKEditor(props) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[200px] flex items-center justify-center border border-[#00000033] rounded-[4px] bg-[#F9FAFB] text-[#6B7280] text-sm">
          Loading editor…
        </div>
      }
    >
      <CKEditorInner {...props} />
    </Suspense>
  );
}
