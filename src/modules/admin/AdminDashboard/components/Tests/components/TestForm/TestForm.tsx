import React, { useEffect, useState, type FormEvent } from 'react';
import type { Level } from '../../../../../../../types/database';
import { useNavigate } from 'react-router-dom';
import type { NewTestPayload, UIPart, UIQuestion } from '../../types/testForm';
import styles from './TestForm.module.scss';
import { getLevelsById } from '../../../../../../../services/levels';

type Props = {
  initialData?: {
    title: string;
    description: string;
    levelId: string;
    parts: UIPart[];
    questions: UIQuestion[];
  };
  onSubmit: (payload: NewTestPayload) => Promise<void>;
};

export const TestForm: React.FC<Props> = ({ initialData, onSubmit }) => {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(
    initialData?.description ?? '',
  );
  const [levelId, setLevelId] = useState(initialData?.levelId ?? '');

  const [parts, setParts] = useState<UIPart[]>(initialData?.parts ?? []);
  const [questions, setQuestions] = useState<UIQuestion[]>(
    initialData?.questions ?? [],
  );

  const [levels, setLevels] = useState<Level[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const loadLevels = async () => {
      try {
        const data = await getLevelsById();

        setLevels(data);
      } catch (error) {
        console.error('Failed to load level data', error);
      }
    };

    loadLevels();
  }, []);

  const handleAddPart = () => {
    const newPart: UIPart = {
      uiId: crypto.randomUUID(),
      title: '',
      instruction: '',
      points: 1,
    };

    setParts([...parts, newPart]);
  };

  const handleUpdatePart = (
    uiId: string,
    fields: Partial<Omit<UIPart, 'uiId'>>,
  ) => {
    setParts(
      parts.map((part) => (part.uiId === uiId ? { ...part, ...fields } : part)),
    );
  };

  const handleRemovePart = (uiId: string) => {
    setParts(parts.filter((part) => part.uiId !== uiId));

    setQuestions(
      questions.map((question) =>
        question.partUiId === uiId
          ? {
              ...question,
              partUiId: null,
            }
          : question,
      ),
    );
  };

  const handleAddQuestion = () => {
    const newQuestion: UIQuestion = {
      uiId: crypto.randomUUID(),
      partUiId: null,
      question: '',
      answers: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
    };

    setQuestions([...questions, newQuestion]);
  };

  const handleUpdateQuestionPart = (uiId: string, partUiId: string) => {
    setQuestions(
      questions.map((question) =>
        question.uiId === uiId
          ? { ...question, partUiId: partUiId || null }
          : question,
      ),
    );
  };

  const handleUpdateQuestionText = (uiId: string, text: string) => {
    setQuestions(
      questions.map((question) =>
        question.uiId === uiId ? { ...question, question: text } : question,
      ),
    );
  };

  const handleUpdateAnswerText = (
    questionUiId: string,
    answerIndex: number,
    text: string,
  ) => {
    setQuestions(
      questions.map((question) => {
        if (question.uiId !== questionUiId) {
          return question;
        }

        const updatedAnswers = question.answers.map((answer, index) =>
          index === answerIndex ? { ...answer, text } : answer,
        );

        return { ...question, answers: updatedAnswers };
      }),
    );
  };

  const handleSelectCorrectAnswer = (
    questionUiId: string,
    correctIndex: number,
  ) => {
    setQuestions(
      questions.map((question) => {
        if (question.uiId !== questionUiId) {
          return question;
        }

        const updatedAnswers = question.answers.map((answer, index) => ({
          ...answer,
          isCorrect: index === correctIndex,
        }));

        return { ...question, answers: updatedAnswers };
      }),
    );
  };

  const handleRemoveQuestion = (uiId: string) => {
    setQuestions(questions.filter((question) => question.uiId !== uiId));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const payload: NewTestPayload = {
      title,
      description,
      levelId,
      parts: parts.map(({ uiId, title, instruction, points }) => ({
        uiId,
        title,
        instruction,
        points,
      })),
      questions: questions.map(({ partUiId, question, answers }) => {
        return {
          partId: partUiId,
          question,
          answers,
        };
      }),
    };

    try {
      await onSubmit(payload);

      navigate('/admin/tests');
    } catch (error) {
      console.error('Failed to create test:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* БЛОК 1: Загальна інформація про тест */}
        <div>
          <div>
            <label htmlFor='testTitle'>Test title *</label>
            <input
              id='testTitle'
              type='text'
              placeholder='e.g. English Placement Test'
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor='testDescription'>Test description *</label>
            <textarea
              id='testDescription'
              placeholder='Short description for students'
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
          </div>

          {/* Level: два select-и, значення підтягуються з таблиці levels, не хардкодяться */}
          <div>
            <label htmlFor='levelCode'>Select level *</label>
            <select
              id='levelCode'
              value={levelId}
              onChange={(event) => setLevelId(event.target.value)}
              required
            >
              <option value=''>Select code...</option>
              {levels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.code} - {level.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* БЛОК 2: Test parts — окрема секція, питання сюди НЕ вкладені */}
        <div>
          <h2>Test parts</h2>

          {parts.map((part) => (
            <div key={part.uiId}>
              <button type='button' onClick={() => handleRemovePart(part.uiId)}>
                ✕
              </button>
              <label htmlFor={`partTitle-${part.uiId}`}>Part title</label>
              <input
                id={`partTitle-${part.uiId}`}
                value={part.title}
                onChange={(event) =>
                  handleUpdatePart(part.uiId, { title: event.target.value })
                }
                placeholder='e.g. Reading | Writing | Listening'
              />
              <label htmlFor={`instruction-${part.uiId}`}>Instruction</label>
              <textarea
                id={`instruction-${part.uiId}`}
                value={part.instruction}
                onChange={(event) =>
                  handleUpdatePart(part.uiId, {
                    instruction: event.target.value,
                  })
                }
                placeholder='Instruction text for this part'
              />
              <label htmlFor={`points-${part.uiId}`}>Points</label>
              <input
                id={`points-${part.uiId}`}
                type='number'
                value={part.points}
                onChange={(event) =>
                  handleUpdatePart(part.uiId, {
                    points: Number(event.target.value),
                  })
                }
              />
            </div>
          ))}

          <button type='button' onClick={handleAddPart}>
            + Add test part
          </button>
        </div>

        {/* БЛОК 3: Questions — окрема секція, кожне питання має свій select Part */}
        <div>
          <h2>Questions</h2>

          {questions.map((question) => (
            <div key={question.uiId}>
              <button
                type='button'
                onClick={() => handleRemoveQuestion(question.uiId)}
              >
                ✕
              </button>
              <label htmlFor={`questionPart-${question.uiId}`}>Part</label>
              <select
                id={`questionPart-${question.uiId}`}
                value={question.partUiId ?? ''}
                onChange={(event) =>
                  handleUpdateQuestionPart(question.uiId, event.target.value)
                }
              >
                <option value=''>No part</option>
                {parts.map((part) => (
                  <option key={part.uiId} value={part.uiId}>
                    {part.title || 'Untitled part'}
                  </option>
                ))}
              </select>
              <label htmlFor={`questionText-${question.uiId}`}>
                Question text
              </label>
              <input
                id={`questionText-${question.uiId}`}
                value={question.question}
                onChange={(event) =>
                  handleUpdateQuestionText(question.uiId, event.target.value)
                }
                type='text'
                placeholder='Question text'
              />
              <h4>Answers</h4>
              {question.answers.map((answer, index) => (
                <div key={index}>
                  <input
                    type='radio'
                    name={`correct-answer-${question.uiId}`}
                    checked={answer.isCorrect}
                    onChange={() =>
                      handleSelectCorrectAnswer(question.uiId, index)
                    }
                  />
                  <input
                    type='text'
                    value={answer.text}
                    onChange={(event) =>
                      handleUpdateAnswerText(
                        question.uiId,
                        index,
                        event.target.value,
                      )
                    }
                    placeholder={`Answer ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          ))}

          <button type='button' onClick={handleAddQuestion}>
            + Add question
          </button>
        </div>

        <div className={styles.buttons}>
          <button type='submit'>Save Test</button>
        </div>
      </form>
    </div>
  );
};
