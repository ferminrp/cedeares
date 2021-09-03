<script>
  let share = false;
  let share_url = window.location;

  function sharer() {
    if (navigator.share) {
      navigator
        .share({
          title: "Listado de CEDEARs",
          url: share_url,
        })
        .then(() => {
          console.log("Gracias por compartir!");
        })
        .catch(console.error);
    } else {
      // fallback
      share = true;
    }
  }

  /* copy to clipboard */
  function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      var successful = document.execCommand("copy");
      var msg = successful ? "successful" : "unsuccessful";
      console.log("Fallback: Copying text command was " + msg);
    } catch (err) {
      console.error("Fallback: Oops, unable to copy", err);
    }

    document.body.removeChild(textArea);
  }
  function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
      return;
    }
    navigator.clipboard.writeText(text).then(
      function () {
        console.log("Async: Copying to clipboard was successful!");
      },
      function (err) {
        console.error("Async: Could not copy text: ", err);
      }
    );
  }
</script>

<div class={share == false ? "share-dialog" : "share-dialog is-open"}>
  <header>
    <h3 class="dialog-title">Comparti esta vista!</h3>
    <button on:click={() => (share = false)} class="close-button"
      ><svg><use href="#close" /></svg></button
    >
  </header>
  <div class="targets">
    <a
      href={"https://www.facebook.com/sharer/sharer.php?u=" + share_url}
      class="button"
    >
      <svg>
        <use href="#facebook" />
      </svg>
      <span>Facebook</span>
    </a>

    <a
      href={"https://twitter.com/intent/tweet?url=" +
        share_url +
        "&text=Miren%20como%20viene%20este%20cedear!"}
      class="button"
    >
      <svg>
        <use href="#twitter" />
      </svg>
      <span>Twitter</span>
    </a>

    <a
      href={"https://www.linkedin.com/shareArticle?mini=true&url=" + share_url}
      class="button"
    >
      <svg>
        <use href="#linkedin" />
      </svg>
      <span>LinkedIn</span>
    </a>

    <a
      href={"mailto:info@example.com?&subject=&cc=&bcc=&body=" + share_url}
      class="button"
    >
      <svg>
        <use href="#email" />
      </svg>
      <span>Email</span>
    </a>
  </div>
  <div class="link">
    <div class="pen-url">{share_url}</div>
    <button on:click={() => copyTextToClipboard(share_url)} class="copy-link"
      >Copy Link</button
    >
  </div>
</div>

<button
  on:click={sharer}
  class="share-button"
  type="button"
  title="Share this article"
>
  <svg>
    <use href="#share-icon" />
  </svg>
  <span>Compartir</span>
</button>

<svg class="hidden">
  <defs>
    <symbol
      id="share-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="feather feather-share"
      ><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline
        points="16 6 12 2 8 6"
      /><line x1="12" y1="2" x2="12" y2="15" /></symbol
    >

    <symbol
      id="facebook"
      viewBox="0 0 24 24"
      fill="#3b5998"
      stroke="#3b5998"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="feather feather-facebook"
      ><path
        d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
      /></symbol
    >

    <symbol
      id="twitter"
      viewBox="0 0 24 24"
      fill="#1da1f2"
      stroke="#1da1f2"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="feather feather-twitter"
      ><path
        d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"
      /></symbol
    >

    <symbol
      id="email"
      viewBox="0 0 24 24"
      fill="#777"
      stroke="#fafafa"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="feather feather-mail"
      ><path
        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
      /><polyline points="22,6 12,13 2,6" /></symbol
    >

    <symbol
      id="linkedin"
      viewBox="0 0 24 24"
      fill="#0077B5"
      stroke="#0077B5"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="feather feather-linkedin"
      ><path
        d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
      /><rect x="2" y="9" width="4" height="12" /><circle
        cx="4"
        cy="4"
        r="2"
      /></symbol
    >

    <symbol
      id="close"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="feather feather-x-square"
      ><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line
        x1="9"
        y1="9"
        x2="15"
        y2="15"
      /><line x1="15" y1="9" x2="9" y2="15" /></symbol
    >
  </defs>
</svg>

<style>
  .hidden {
    display: none;
  }

  svg {
    width: 20px;
    height: 20px;
    margin-right: 7px;
  }

  button,
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: auto;
    padding-top: 8px;
    padding-bottom: 8px;
    color: #353535;
    text-align: center;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.1;
    letter-spacing: 2px;
    text-transform: capitalize;
    text-decoration: none;
    white-space: nowrap;
    border-radius: 4px;
    border: 1px solid #ff3e0080;
    cursor: pointer;
    background-color: #fdd2c1;
  }

  button:hover,
  .button:hover {
    border-color: #cdd;
  }

  .share-button,
  .copy-link {
    padding-left: 30px;
    padding-right: 30px;
  }

  .share-button {
    margin-top: 3rem;
  }

  .share-dialog {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: none;
    width: 95%;
    max-width: 500px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    z-index: -1;
    border: 1px solid #ddd;
    padding: 20px;
    border-radius: 4px;
    background-color: #fff;
  }

  .share-dialog.is-open {
    display: block;
    z-index: 2;
  }

  header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .targets {
    display: grid;
    grid-template-rows: 1fr 1fr;
    grid-template-columns: 1fr 1fr;
    grid-gap: 20px;
    margin-bottom: 20px;
  }

  .close-button {
    background-color: transparent;
    border: none;
    padding: 0;
  }

  .close-button svg {
    margin-right: 0;
  }

  .link {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    border-radius: 4px;
    background-color: #eee;
  }

  .pen-url {
    margin-right: 15px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
