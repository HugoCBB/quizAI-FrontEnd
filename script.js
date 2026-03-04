const form = document.getElementById('form');
const themeInput = document.getElementById('input-theme');
const quantityInput = document.getElementById('input-quantity');
const cardContainer = document.getElementById('cards')

const questionForm = {
    theme: "",
    question_quantity: 1
}

const formSubmit = () => {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        questionForm.theme = themeInput.value;
        questionForm.question_quantity = Number(quantityInput.value);

        const data = await generateCard(questionForm);
        if (!data) console.log("Erro ao criar questionario");

        const questionsArray = Array.isArray(data.questions) ? data.questions : (Array.isArray(data) ? data : null);

        renderCards(questionsArray)
    });
};


const generateCard = async ({ theme, question_quantity }) => {
      const url = "https://api-quizai-production.up.railway.app/question/";

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ theme, question_quantity})
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP ${response.status} - ${text}`);
        }

        const data = await response.json();
        console.log(data)
        return data
      } catch (error) {
        console.error("Erro ao criar questionario:", error);
        return error
      }
      
    };

const renderCards = (data) => {
  cardContainer.innerHTML = "";

  if (!data) {
    cardContainer.innerHTML = "<p>Erro ou formato inválido da resposta da API. Veja o console.</p>";
    return;
  }

  if (data.length === 0) {
    cardContainer.innerHTML = "<p>Sem perguntas para renderizar.</p>";
    return;
  }

  data.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'card';

    const h3 = document.createElement('h3');
    h3.textContent = `${index + 1} - ${item.title || 'Sem título'}`;
    card.appendChild(h3);

    if (item.difficulty) {
      const diff = document.createElement('p');
      diff.textContent = `Dificuldade: ${item.difficulty}`;
      card.appendChild(diff);
    }

    const altContainer = document.createElement('div');
    altContainer.className = 'alternatives';

    const alternativas = Array.isArray(item.alternatives) ? item.alternatives : [];

    if (alternativas.length === 0) {
      const p = document.createElement('p');
      p.textContent = "Nenhuma alternativa disponível.";
      altContainer.appendChild(p);
    } else {
      alternativas.forEach((alt) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'alt-btn';

        btn.textContent = `${alt.label ? alt.label + " - " : ""}${alt.text ?? ''}`;
        btn.dataset.correct = String(Boolean(alt.is_correct));

        btn.addEventListener('click', () => {
          Array.from(altContainer.querySelectorAll('button')).forEach((b) => b.disabled = true);

          if (btn.dataset.correct === "true") {
            btn.style.backgroundColor = "green";
            btn.style.color = "white";
          } else {
            btn.style.backgroundColor = "red";
            btn.style.color = "white";
            const correctBtn = altContainer.querySelector('button[data-correct="true"]');
            if (correctBtn) {
              correctBtn.style.backgroundColor = "green";
              correctBtn.style.color = "white";
            }
          }
        });

        altContainer.appendChild(btn);
      });
    }

    card.appendChild(altContainer);
    cardContainer.appendChild(card);
  });
};

const main = () => {
    formSubmit()
}

main()
