# El Léxico — the interface in English, and the report to the teacher

September 2026. Touches `index.html`, `style.css` and `app.js` in
**A-Level-Spanish-Edexcel-Vocabulary-training**.

## The interface is in English

The site's own language — tabs, buttons, headings, feedback, the progress
report — is English. Reading a button is not part of the A-Level; making a
student decode *Enviar ahora a mi profesor* before they can hand work in adds a
hurdle that tests nothing. The Spanish is the content: the words, the prompts,
the answers, the unit titles as the exercise book gives them. That is where the
difficulty belongs.

Every string the interface shows now sits in the `T` block of `app.js`, in
English, with the same keys as before, so nothing else in the engine changed.
The tabs are Home · Review · Exam · Progress; `<html lang>` is `en`.

## What changed

The code only ever moved when a student remembered to go to *Progreso*, find it
and send it, which is to say hardly ever. Two things now carry it.

**1. A panel at the end of every activity.** After a lesson, a review, the leech
deck or an exam, directly under the score and *above* the list of words to
review, a bordered card says what the teacher will see — *32 palabras vistas,
10 dominadas, 72 % de precisión* — and offers one button, *Enviar ahora a mi
profesor*. The moment a student has just finished something is the only moment
they are certainly looking at the screen, so that is where the ask now lives.
If the name box is still empty, the panel carries an inline name field with a
line explaining why it matters. The button works either way: nothing is
withheld, nothing is compulsory.

**2. A status strip under the header, on every tab including Inicio.** One line,
three states:

* **amber** — *Tu profesor todavía no ha recibido nada tuyo. 1 actividad
  todavía sin enviar.* — with an *Enviar ahora* button;
* **amber** — *Enviado hace 2 días · 4 actividades sin enviar desde entonces.* —
  same button;
* **green** — *Enviado a tu profesor hace un momento · todo al día.* — no button,
  because there is nothing to ask for.

It hides itself entirely for a student who has not done anything yet, so a first
visit is not met with a demand.

Both routes, and the old button in *Progreso*, now go through one function, so
all three behave identically and all three record the send. What is recorded is
`S.sent = {t, s, x}` — when, and how much had been done at that point — which is
what lets the strip count what has happened since.

## The one paste that is still there, and how to remove it

The form opens with the code **copied to the clipboard**, and the student pastes
it into the *Code* box. That step disappears the moment the form's field tokens
are known. In `app.js`, at the top, `FORMS_FIELD_NAME` and `FORMS_FIELD_CODE`
are empty strings. To fill them:

1. open the Spanish form in MS Forms;
2. **… → Get a link to fill in as the teacher → Get pre-filled answer**;
3. type anything into the name box and anything into the code box, press
   **Get link**;
4. the URL handed back carries one `&rXXXXXXXXXXXX=` pair per question. Put the
   token of the **name** question into `FORMS_FIELD_NAME` and the token of the
   **code** question into `FORMS_FIELD_CODE`.

The wording in the panel switches by itself: *se abre el formulario con tu nombre
y tu código ya rellenados: solo tienes que pulsar Enviar.* One tap, no paste.

## What was not done

No silent transmission. That needs a Power Automate "When an HTTP request is
received" flow, whose URL would go in `CFG.ALERT_URL` — the hook is already in
the file and is currently used only for flagged answers. Say the word and the
same snapshot can be posted to it with no student action at all.

The French site runs the same engine from the same source, so this ports to it
almost unchanged; not done here.

## Verified

25 end-to-end checks in headless Chromium against a local copy of the site:
the strip hidden on a fresh install; a full 32-word lesson played through to the
summary; the panel present, above the review list, saying what will travel; the
strip amber with the right count, then green with no button; the address built
for MS Forms; the code on the clipboard; the send recorded in local storage
together with the activity count; the state surviving a reload; two further
activities turning the strip amber again with the count right; and the old
*Progreso* button clearing the strip the same way.
