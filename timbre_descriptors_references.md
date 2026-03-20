# Timbral Descriptors — References for LaTeX

The following descriptors are used in the Drum Timbre Recommender to translate
acoustic features into musical language. Each term is grounded in the literature
indicated below.

---

## Bright / Dark \& Warm
**Feature:** Zero-Crossing Rate (ZCR)

ZCR correlates with the presence of high-frequency content and is widely used as
a proxy for timbral brightness. The concept of \textit{brightness} as a perceptual
dimension of timbre is one of the most robust findings in psychoacoustics, appearing
consistently in multidimensional scaling studies of musical instruments.

\begin{itemize}
  \item Grey, J.~M. (1977). Multidimensional perceptual scaling of musical timbres.
        \textit{Journal of the Acoustical Society of America}, 61(5), 1270--1277.
  \item McAdams, S., Winsberg, S., Donnadieu, S., De Soete, G., \& Krimphoff, J. (1995).
        Perceptual scaling of synthesized musical timbres: Common dimensions, specificities,
        and latent subject classes. \textit{Psychological Research}, 58(3), 177--192.
  \item Krumhansl, C.~L. (1989). Why is musical meter so hard to hear? The role of perceptual
        organization. In S. McAdams \& I. Deliège (Eds.), \textit{Music and the Cognitive Sciences}.
        Cambridge University Press.
\end{itemize}

---

## Resonant / Tight \& Dry
**Feature:** Effective Duration

Effective Duration measures how long the sound energy persists after the initial
attack. In percussion acoustics, this directly determines whether a drum is perceived
as \textit{resonant} (long decay) or \textit{dry and tight} (short, controlled decay).
The terms ``dry'' and ``tight'' are standard in both the acoustics and music production
literature.

\begin{itemize}
  \item Rossing, T.~D. (2000). \textit{Science of Percussion Instruments}.
        World Scientific.
  \item Moylan, W. (2014). \textit{The Art of Recording: Understanding and Crafting
        the Mix} (3rd ed.). Focal Press.
\end{itemize}

---

## Clear Pitch / Bell-like
**Feature:** Inharmonicity

Inharmonicity quantifies the deviation of partial frequencies from the ideal harmonic
series. Low inharmonicity yields a clearly pitched, fundamental-dominated sound;
high inharmonicity produces complex, metallic, bell-like tones. This relationship is
treated extensively in the physical modelling of percussion instruments.

\begin{itemize}
  \item Fletcher, N.~H., \& Rossing, T.~D. (1998). \textit{The Physics of Musical
        Instruments} (2nd ed.). Springer.
  \item Rossing, T.~D. (2000). \textit{Science of Percussion Instruments}.
        World Scientific.
\end{itemize}

---

## Powerful / Delicate
**Feature:** Root Mean Square energy (RMS)

RMS energy is a direct measure of signal power and closely corresponds to perceived
loudness and projection. In the context of drum sounds, higher RMS values are
associated with a more assertive, projecting sound, while lower values produce a
softer, more delicate character.

\begin{itemize}
  \item Zwicker, E., \& Fastl, H. (1999). \textit{Psychoacoustics: Facts and Models}
        (2nd ed.). Springer.
\end{itemize}

---

## Complex / Pure
**Feature:** Spectral Entropy

Spectral Entropy measures the uniformity of the spectral energy distribution. High
entropy indicates a richly structured, complex harmonic content; low entropy reflects
a spectrally simple, pure tone. This measure has been applied to timbre classification
in Music Information Retrieval.

\begin{itemize}
  \item Tzanetakis, G., \& Cook, P. (2002). Musical genre classification of audio signals.
        \textit{IEEE Transactions on Speech and Audio Processing}, 10(5), 293--302.
\end{itemize}

---

## Focused / Spread
**Feature:** Spectral Kurtosis

Spectral Kurtosis measures how sharply concentrated spectral energy is around
particular frequencies. High kurtosis indicates a tonally focused, resonant character;
low kurtosis describes a spectrally diffuse, spread sound. This descriptor is more
technical and is primarily found in signal processing and MIR literature rather than
in perceptual psychoacoustics.

\begin{itemize}
  \item Tzanetakis, G., \& Cook, P. (2002). Musical genre classification of audio signals.
        \textit{IEEE Transactions on Speech and Audio Processing}, 10(5), 293--302.
\end{itemize}

---

## Textured / Clean
**Feature:** Spectral Flatness

Spectral Flatness (also known as Wiener entropy) compares the geometric mean to the
arithmetic mean of the spectrum. Values near 1 indicate a noise-like, textured signal;
values near 0 indicate a tonal, clean signal. This measure is standard in audio
processing but its verbal counterparts (``textured'', ``clean'') come primarily from
music production vocabulary rather than formal psychoacoustics.

\textbf{Note:} Use this descriptor with care in formal academic writing; prefer
``noise-like'' or ``tonal'' when citing acoustic properties.

\begin{itemize}
  \item Tzanetakis, G., \& Cook, P. (2002). Musical genre classification of audio signals.
        \textit{IEEE Transactions on Speech and Audio Processing}, 10(5), 293--302.
\end{itemize}

---

## Open Highs / Fast Decay
**Feature:** Spectral Slope

Spectral Slope describes how rapidly spectral energy decreases from low to high
frequencies. A gentle slope (sustained highs) yields an open, airy character; a steep
slope (fast high-frequency decay) produces a warmer, more body-dominated sound.

\begin{itemize}
  \item Tzanetakis, G., \& Cook, P. (2002). Musical genre classification of audio signals.
        \textit{IEEE Transactions on Speech and Audio Processing}, 10(5), 293--302.
\end{itemize}

---

## General Timbre References

These works provide broader theoretical grounding for the use of acoustic features
as timbral descriptors:

\begin{itemize}
  \item Roederer, J.~G. (2008). \textit{The Physics and Psychophysics of Music:
        An Introduction} (4th ed.). Springer.
  \item Helmholtz, H.~L.~F. (1954). \textit{On the Sensations of Tone} (A.~J. Ellis,
        Trans.). Dover. (Original work published 1877)
  \item McAdams, S. (2013). Musical timbre perception. In D. Deutsch (Ed.),
        \textit{The Psychology of Music} (3rd ed., pp.~35--67). Academic Press.
\end{itemize}
