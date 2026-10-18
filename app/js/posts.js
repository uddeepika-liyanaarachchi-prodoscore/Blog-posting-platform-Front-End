import api from "./api.js";
import { notify } from "./notify.js";

const postsStore = new Map();

function truncateText(text, maxLength = 20) {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}

function createCardHTML(post, isOwner = false) {
  const imageUrl = post.image_url;
  const rawDescription = post.content || post.description || "";
  const shortDescription = truncateText(rawDescription, 20);

  const isPublished = post.status === "PUBLISHED";
  let ownerActions = "";

  if (isOwner) {
    ownerActions = `
      <div class="card-actions" style="margin-top: 10px; display: flex; gap: 6px; flex-wrap: wrap;">
        <button 
          class="btn toggle-publish-btn" 
          data-id="${post.id}"
          style="background: ${isPublished ? "#f59e0b" : "#10b981"}; color: #fff; padding: 4px 8px; border-radius: 4px; border: none; cursor: pointer;">
          ${isPublished ? "Unpublish" : "Publish"}
        </button>
        
        <button 
          class="btn edit-post-btn" 
          data-id="${post.id}" 
          ${isPublished ? "disabled title='Unpublish first to edit'" : ""}
          style="background: #3b82f6; color: #fff; padding: 4px 8px; border-radius: 4px; border: none; cursor: ${isPublished ? "not-allowed" : "pointer"}; opacity: ${isPublished ? "0.5" : "1"};">
          Edit
        </button>

        <button 
          class="btn delete-post-btn" 
          data-id="${post.id}" 
          ${isPublished ? "disabled title='Unpublish first to delete'" : ""}
          style="background: #ef4444; color: #fff; padding: 4px 8px; border-radius: 4px; border: none; cursor: ${isPublished ? "not-allowed" : "pointer"}; opacity: ${isPublished ? "0.5" : "1"};">
          Delete
        </button>
      </div>
    `;
  }

  return `
    <div class="card" data-id="${post.id}">
      <img class="card-bg" src="${imageUrl}" alt="${post.title || "Post Image"}" />
      <div class="overlay"></div>
      <div class="details">
        <h2>${post.title}</h2>
        <p>${shortDescription}</p>
        <button class="btn view-post-btn" data-id="${post.id}">View</button>
        ${ownerActions}
      </div>
    </div>
  `;
}

export function openPostModal(post) {
  const modal = document.getElementById("post-modal");
  const modalImg = document.getElementById("modal-post-img");
  const modalTitle = document.getElementById("modal-post-title");
  const modalDesc = document.getElementById("modal-post-desc");

  if (!modal || !post) return;

  modalImg.src = post.image_url;
  modalTitle.textContent = post.title || "Untitled Post";
  modalDesc.textContent =
    post.content || post.description || "No content available.";
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

export function closePostModal() {
  const modal = document.getElementById("post-modal");
  if (modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = "auto";
  }
}

export function openPostFormModal(post = null) {
  const modal = document.getElementById("post-form-modal");
  const form = document.getElementById("post-crud-form");
  const formTitle = document.getElementById("form-modal-title");
  const idInput = document.getElementById("crud-post-id");
  const titleInput = document.getElementById("crud-title");
  const contentInput = document.getElementById("crud-content");
  const imageInput = document.getElementById("crud-image");

  form.reset();

  if (post) {
    formTitle.textContent = "Update Post";
    idInput.value = post.id;
    titleInput.value = post.title || "";
    contentInput.value = post.content || post.description || "";
  } else {
    formTitle.textContent = "Create New Post";
    idInput.value = "";
  }

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

export function closePostFormModal() {
  const modal = document.getElementById("post-form-modal");
  if (modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = "auto";
  }
}

export async function loadPublicPosts(search = "", page = 1, limit = 10) {
  const container = document.querySelector("#main-view .pins-grid");
  if (!container) return;

  container.innerHTML = "<p>Loading posts...</p>";

  try {
    const response = await api.get("/posts/get-all-posts", {
      params: { search, page, limit },
    });

    const posts = Array.isArray(response.data)
      ? response.data
      : response.data.items || response.data.posts || [];

    if (posts.length === 0) {
      container.innerHTML = "<p>No posts found.</p>";
      return;
    }

    posts.forEach((post) => postsStore.set(String(post.id), post));

    container.innerHTML = posts
      .map((post) => createCardHTML(post, false))
      .join("");
  } catch (err) {
    console.error("Failed to fetch public posts:", err);
    container.innerHTML = "<p>Error loading public posts.</p>";
  }
}

export async function loadUserPosts(search = "", page = 1, limit = 10) {
  const container = document.querySelector("#my-view .pins-grid");
  if (!container) return;

  container.innerHTML = "<p>Loading your posts...</p>";

  try {
    const userID = localStorage.getItem("userID");
    if (!userID) {
      container.innerHTML = "<p>User session missing. Please log in again.</p>";
      return;
    }

    const response = await api.get(`/posts/get-all/${userID}`, {
      params: { search, page, limit },
    });

    const posts = Array.isArray(response.data)
      ? response.data
      : response.data.items || response.data.posts || [];

    if (posts.length === 0) {
      container.innerHTML = "<p>You have not created any posts yet.</p>";
      return;
    }

    posts.forEach((post) => postsStore.set(String(post.id), post));

    container.innerHTML = posts
      .map((post) => createCardHTML(post, true))
      .join("");
  } catch (err) {
    console.error("Failed to fetch user posts:", err);
    container.innerHTML = "<p>Error loading your posts.</p>";
  }
}

document
  .getElementById("post-crud-form")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const postId = document.getElementById("crud-post-id").value;
    const title = document.getElementById("crud-title").value;
    const content = document.getElementById("crud-content").value;
    const imageFile = document.getElementById("crud-image").files[0];

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    const submitBtn = document.getElementById("crud-submit-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    try {
      if (postId) {
        // UPDATE post
        await api.put(`/posts/update-posts/${postId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        notify.success("Post updated successfully!");
      } else {
        // CREATE post
        await api.post("/posts/create-posts", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        notify.success("Post created successfully!");
      }

      closePostFormModal();
      await loadUserPosts();
    } catch (err) {
      console.error("Error saving post:", err);
      notify.error("Operation failed");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Save Post";
    }
  });

document.addEventListener("click", async (e) => {
  const viewBtn = e.target.closest(".view-post-btn");
  if (viewBtn) {
    const postId = viewBtn.dataset.id;
    const post = postsStore.get(String(postId));
    if (post) {
      openPostModal(post);
    }
    return;
  }

  if (e.target.id === "open-create-post-btn") {
    openPostFormModal(null);
    return;
  }

  const editBtn = e.target.closest(".edit-post-btn");
  if (editBtn) {
    const post = postsStore.get(String(editBtn.dataset.id));
    if (post) {
      if (post.status === "PUBLISHED") {
        notify.info("Please unpublish this post before editing.");
        return;
      }
      openPostFormModal(post);
    }
    return;
  }

  const toggleBtn = e.target.closest(".toggle-publish-btn");
  if (toggleBtn) {
    const postId = toggleBtn.dataset.id;
    try {
      await api.patch(`/posts/unpublish/${postId}`);
      notify.success("Post status updated!");
      await loadUserPosts();
    } catch (err) {
      console.error("Error toggling publish state:", err);
      notify.error("Error toggling publish");
    }
    return;
  }

  const deleteBtn = e.target.closest(".delete-post-btn");
  if (deleteBtn) {
    const postId = deleteBtn.dataset.id;
    const post = postsStore.get(String(postId));

    if (post.status === "PUBLISHED") {
      notify.info("Please unpublish the post before deleting.");
      return;
    }

    if (confirm("Are you sure you want to delete this post?")) {
      try {
        await api.patch(`/posts/delete/${postId}`);
        notify.success("Post deleted successfully!");
        await loadUserPosts();
      } catch (err) {
        console.error("Error deleting post:", err);
        notify.error("Failed to delete post");
      }
    }
    return;
  }

  if (
    e.target.id === "modal-close-btn" ||
    e.target.id === "modal-close-backdrop"
  ) {
    closePostModal();
  }

  if (
    e.target.id === "form-modal-close-btn" ||
    e.target.id === "form-modal-close-backdrop"
  ) {
    closePostFormModal();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closePostModal();
    closePostFormModal();
  }
});
