<template>
  <q-layout>
    <q-page-container>
      <q-page>
      <div class="row mx-0">
        <q-toolbar class="col-12 menu-bar" id="menu-bar">
          <q-btn
            class="menu-button"
            @click="editor.chain().focus().undo().run()"
            round
            flat
            size="sm"
            :ripple="false"
            icon="undo"
          />
          <q-btn
            class="menu-button"
            @click="editor.chain().focus().redo().run()"
            icon="redo"
            flat
            size="sm"
            :ripple="false"
          />
          <q-btn
            class="menu-button"
            @click="editor.chain().focus().toggleBold().run()"
            icon="format_bold"
            round
            flat
            size="sm"
            :class="{ 'is-active': editor?.isActive('bold')}"
            :ripple="false"
          />
          <q-btn
            class="menu-button"
            @click="editor.chain().focus().toggleItalic().run()"
            icon="format_italic"
            round
            flat
            size="sm"
            :class="{ 'is-active': editor?.isActive('italic')}"
            :ripple="false"
          />

          <q-separator dark vertical inset class="separator" />

          <q-btn
            class="menu-button"
            @click="editor.chain().focus().toggleHeading({level: 3}).run()"
            label="H1"
            round
            flat
            size="sm"
            :class="{ 'is-active': editor?.isActive('heading, {level: 3}')}"
            :ripple="false"
          />
          <q-btn
            class="menu-button"
            @click="editor.chain().focus().toggleHeading({level: 4}).run()"
            label="H2"
            round
            flat
            size="sm"
            :class="{ 'is-active': editor?.isActive('heading, {level: 4}')}"
            :ripple="false"
          />
          <q-btn
            class="menu-button"
            @click="editor.chain().focus().toggleHeading({level: 5}).run()"
            label="H3"
            round
            flat
            size="sm"
            :class="{ 'is-active': editor?.isActive('heading, {level: 5}')}"
            :ripple="false"
          />

          <q-separator dark vertical inset class="separator" />

          <q-btn
            class="menu-button"
            @click="editor.chain().focus().setTextAlign('left').run()"
            round
            icon="format_align_left"
            flat
            size="sm"
            :class="{ 'is-active': editor?.isActive({ textAlign: 'left' }) }"
            :ripple="false"
          />

          <q-btn
            class="menu-button"
            @click="editor.chain().focus().setTextAlign('center').run()"
            round
            icon="format_align_center"
            flat
            size="sm"
            :class="{ 'is-active': editor?.isActive({ textAlign: 'center' })}"
            :ripple="false"
          />

          <q-btn
            class="menu-button"
            @click="editor.chain().focus().setTextAlign('right').run()"
            round
            icon="format_align_right"
            flat
            size="sm"
            :class="{ 'is-active': editor?.isActive({ textAlign: 'right' }) }"
            :ripple="false"
          />

          <q-btn
            class="menu-button"
            @click="editor.chain().focus().setTextAlign('justify').run()"
            round
            icon="format_align_justify"
            flat
            size="sm"
            :class="{ 'is-active': editor?.isActive({ textAlign: 'justify'} ) } "
            :ripple="false"
          />

        </q-toolbar>
      </div>

      <q-page-container>
        <q-page>
          <div class="row editor-container">
            <div class="col-12 ">
              <editor-content :editor="editor" />
            </div>
          </div>
        </q-page>
      </q-page-container>

      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
  import { onMounted, onBeforeUnmount } from 'vue';
  import { EditorContent, useEditor } from '@tiptap/vue-3';
  import TextAlign from '@tiptap/extension-text-align';
  import Image from '@tiptap/extension-image';
  import Underline from '@tiptap/extension-underline';
  import FontFamily from '@tiptap/extension-font-family';
  import StarterKit from '@tiptap/starter-kit';
  import Collaboration from "@tiptap/extension-collaboration";
  import { HocuspocusProvider } from "@hocuspocus/provider";


  const serverHostname = import.meta.env.VITE_SERVER_HOSTNAME || "localhost";
  const serverPort = import.meta.env.VITE_SERVER_PORT || 8787;

  const provider = new HocuspocusProvider({
    url: `ws://${serverHostname}:${serverPort}/collaboration`,
    name: "my-document"
  });

  provider.on("sync", () => {
    console.log("Document synced!");
  });

  provider.on("status", (status) => {
    console.log("WebSocket status:", status);
  });

  provider.on("error", (error) => {
    console.log(error);
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: true,
        heading: {
          levels: [3, 4, 5]
        }
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
        defaultAlignment: "left"
      }),
      Image.configure({}),
      Underline.configure({}),
      FontFamily.configure({}),
      Collaboration.configure({ document: provider.document, user: { name: "John Doe", color: "#ffcc00" }, }),
    ]
  });

  onMounted(() => {
    console.log("Editor mounted!");
  });
  onBeforeUnmount(() => {
    console.log("Tearing down editor.");
    provider.destroy();  // Close WebSocket connection
    // ydoc.destroy();      // Free up memory used by Yjs document
    editor.value?.destroy()
  });
</script>

<style lang="css" scoped>

  /* Give a remote user a caret */
  .collaboration-cursor__caret {
    border-left: 1px solid #0d0d0d;
    border-right: 1px solid #0d0d0d;
    margin-left: -1px;
    margin-right: -1px;
    pointer-events: none;
    position: relative;
    word-break: normal;
  }

  /* Render the username above the caret */
  .collaboration-cursor__label {
    border-radius: 3px 3px 3px 0;
    color: #0d0d0d;
    font-size: 12px;
    font-style: normal;
    font-weight: 600;
    left: -1px;
    line-height: normal;
    padding: 0.1rem 0.3rem;
    position: absolute;
    top: -1.4em;
    user-select: none;
    white-space: nowrap;
  }

.editor-container {
  min-height: inherit;
  display: flex;
  flex-direction: column;
  /* Add padding to create space around the "paper" and a background color */
  background-color: #f0f2f5; /* A light grey background makes the white paper pop */
  padding: 3rem;
  margin: 0 auto;
}

.editor-container .col-12 {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

/* This is the crucial part you were missing */
.editor-container .col-12 > div {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.editor-container .editor-content {
  flex-grow: 1; /* Make the editor content itself grow */
  display: flex;
  flex-direction: column;

}

.editor-container :deep(.ProseMirror) {
  display: flex;
  flex-grow: 1;
  overflow-y: auto;
  flex-direction: column;

  /* --- A4 Paper Styling --- */
  background: #fff; /* The paper should be white */
  border-radius: 3px; /* A very subtle rounding of corners looks better */
  box-shadow: 0 0 15px rgba(0,0,0,0.1); /* A soft shadow to lift it off the page */

}

.menu-bar {
  background-color: #F6F6F6;
  border-radius: 10px;  /* Slightly rounded corners */
}

.menu-button {
  color: black;
  transition: all 0.2s ease-in-out;
  margin: 0.1rem;
}

.menu-button:hover {
  background-color: #F6F6F6;
}

.menu-button.is-active {
  background-color: lightgray;
  transform: translateY(1px); /* Slight sinking effect */
  box-shadow: inset 0px 2px 4px rgba(0, 0, 0, 0.3); /* Inner shadow */
}

.separator {
  background-color: lightgray;
  margin: 0.5rem;
}

</style>
