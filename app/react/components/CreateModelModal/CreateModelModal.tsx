import Dropdown from "@components/Dropdown";
import { DropdownOption } from "@components/Dropdown/Dropdown";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import loadingDots from "../../../img/loading-dots.gif";
import { saveModel } from "../../services/modelStore";
import { Model } from "../../services/types/model";
import Dialog from "../Dialog";

interface ModelTypeOption {
	name: string;
	type: string;
}

const TYPE_OPTIONS: ModelTypeOption[] = [
	{ name: "Conceptual", type: "conceptual" },
	{ name: "Logical", type: "logic" },
	{ name: "NoSQL", type: "nosql" },
	{ name: "Polyglot Persistence", type: "polyglot" },
];

const TypeOptions = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

const TypeOption = styled.label`
	display: flex;
	justify-content: center;
	flex-direction: column;
	gap: 8px;
	padding: 8px 12px;
	border: 1px solid rgba(0, 0, 0, 0.12);
	border-radius: 4px;
	cursor: pointer;
	margin: 0;
	font-weight: normal;

	&:hover {
		background-color: rgba(0, 0, 0, 0.03);
	}

	input[type="radio"] {
		margin: 0;
	}
`;

const EMPTY_MODEL = '{"cells":[]}';

export interface CreateModelResult {
	model: Model;
}

export interface CreateModelModalProps {
	open: boolean;
	cancelable?: boolean;
	onSuccess: (result: CreateModelResult) => void;
	onCancel: () => void;
	onError: (error: unknown) => void;
	models: Model[];
}

const EMPTY_SELECTION = { id: "", name: "Select", type: "empty" };

const CreateModelModal: React.FC<CreateModelModalProps> = ({
	open,
	cancelable = true,
	onSuccess,
	onCancel,
	onError,
	models,
}) => {
	const { t } = useTranslation(["common"]);
	const [name, setName] = useState("");
	const [typeSelected, setTypeSelected] = useState<ModelTypeOption>(
		TYPE_OPTIONS[0],
	);
	const [selectedConceptual, setSelectedConceptual] = useState<Model>();
	const [dropdownSelected, setDropdownSelected] =
		useState<DropdownOption>(EMPTY_SELECTION);
	const [submitted, setSubmitted] = useState(false);
	const [loading, setLoading] = useState(false);

	const isPolyglot = (option: ModelTypeOption) => option === TYPE_OPTIONS[3];

	const isInvalid = name.trim() === "" && submitted;

	const handleSave = async () => {
		setSubmitted(true);
		const trimmedName = name.trim();
		if (trimmedName === "") return;
		setLoading(true);
		try {
			if (typeSelected === TYPE_OPTIONS[3] && selectedConceptual) {
				const savedModel = await saveModel({
					name: trimmedName,
					type: typeSelected.type,
					model: selectedConceptual.model,
				});
				onSuccess({ model: savedModel });
			} else {
				const savedModel = await saveModel({
					name: trimmedName,
					type: typeSelected.type,
					model: EMPTY_MODEL,
				});
				onSuccess({ model: savedModel });
			}
		} catch (error) {
			onError(error);
		} finally {
			setLoading(false);
		}
	};

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) return;
		if (loading) return;
		if (!cancelable) return;
		onCancel();
	};

	const handleConceptualSelected = (selected: string) => {
		const found = models.find((model) => model.name === selected);
		if (found) setSelectedConceptual(found);
	};

	const conceptualOptions: DropdownOption[] = useMemo(
		() =>
			models
				.filter((m) => m.type === "conceptual")
				.map((m) => ({ name: m.name, type: m.type, id: m._id })),
		[models],
	);

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}
			title={t("New model")}
			closeOnOverlayClick={cancelable && !loading}
			closeOnEscape={cancelable && !loading}
		>
			<img
				src={loadingDots}
				alt="Loading"
				className={`br-loader br-loader-divider ${loading ? "loading" : ""}`}
			/>
			<div className="modal-body">
				<form
					className="form-horizontal"
					role="form"
					onSubmit={(event) => {
						event.preventDefault();
						handleSave();
					}}
				>
					<div className="form-group">
						<label htmlFor="name" className="col-sm-3 control-label">
							{t("Title")}
						</label>
						<div className="col-sm-7">
							<input
								id="name"
								type="text"
								className={`form-control ${isInvalid ? "error" : ""}`}
								name="name"
								value={name}
								onChange={(event) => setName(event.target.value)}
								placeholder={t("Model name")}
								autoComplete="off"
								disabled={loading}
								autoFocus
							/>
						</div>
					</div>

					<div className="form-group">
						<label className="col-sm-3 control-label">{t("Type")}</label>
						<div className="col-sm-7">
							<TypeOptions>
								{TYPE_OPTIONS.map((option) => (
									<TypeOption key={option.type}>
										<div style={{ display: "flex", gap: "8px" }}>
											<input
												type="radio"
												name="model-type"
												value={option.type}
												checked={typeSelected.type === option.type}
												onChange={() => setTypeSelected(option)}
												disabled={loading}
											/>
											<span>{t(option.name)}</span>
										</div>
										<div>
											{isPolyglot(option) && (
												<>
													<label  style={{ marginTop: "8px" }}>{t("Choose a conceptual model:")}</label>
													<Dropdown
														options={conceptualOptions}
														selected={dropdownSelected}
														onSelect={(selected) => {
															setDropdownSelected(selected);
															handleConceptualSelected(selected.name);
														}}
														disabled={typeSelected.type !== "polyglot"}
													></Dropdown>
												</>
											)}
										</div>
									</TypeOption>
								))}
							</TypeOptions>
						</div>
					</div>
				</form>
			</div>
			<div className="modal-footer">
				{cancelable && (
					<button
						className="br-button warning"
						type="button"
						onClick={onCancel}
						disabled={loading}
					>
						{t("Cancel")}
					</button>
				)}
				<button
					className="br-button"
					type="button"
					onClick={handleSave}
					disabled={loading}
				>
					{t("Save")}
				</button>
			</div>
		</Dialog>
	);
};

export default CreateModelModal;
