import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Dialog from "../Dialog";

interface NonFunctionalRequirement {
	name: string;
	description: string;
}

const NFR_OPTIONS: NonFunctionalRequirement[] = [
	{
		name: "Strong consistency",
		description: "Ensure the validity of a transaction once completed.",
	},
	{
		name: "Data integrity",
		description: "Ensure the accuracy and integrity of data.",
	},
	{
		name: "Query complexity",
		description:
			"Requires operations involving multiple conditions, joins, etc.",
	},
	{
		name: "Scalability",
		description: "System's ability to handle horizontal growth.",
	},
	{
		name: "High data volume",
		description: "Storing and managing large amounts of data.",
	},
	{
		name: "High velocity",
		description: "Process data at high speeds.",
	},
	{
		name: "Schema flexibility",
		description:
			"Ability to accommodate changes in data structure without requiring extensive schema modifications.",
	},
	{
		name: "Heterogeneous data",
		description: "Requires handling data with different formats and sources.",
	},
];

export interface NfrModalProps {
	open: boolean;
	onSuccess: (result: string[]) => void;
	onCancel: () => void;
	onError: (error: unknown) => void;
	selectedValue?: string[];
}

const NfrModal: React.FC<NfrModalProps> = ({
	open,
	onSuccess,
	onCancel,
	onError,
	selectedValue,
}) => {
	const { t } = useTranslation(["common"]);
	const [nfrsSelected, setNfrsSelected] = useState<string[]>(
		Array.isArray(selectedValue) ? selectedValue : [],
	);

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) return;
	};

	const containerRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		const handleOutside = (event: Event) => {
			const inside = containerRef.current?.contains(event.target as Node);
			if (containerRef.current && !inside) {
				handleOpenChange(true);
			}
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") handleOpenChange(true);
		};

		document.addEventListener("pointerdown", handleOutside, true);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("pointerdown", handleOutside, true);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [containerRef.current?.onclick]);

	const handleSave = () => {
		try {
			onSuccess(nfrsSelected);
		} catch (error) {
			onError(error);
		}
	};

	const isChecked = (option: string) => nfrsSelected?.some((nfr) => nfr === option,) as boolean


	const handleClick = (option: string) => {		
		setNfrsSelected((prev) =>
			!isChecked(option) ? [...prev, option] : prev.filter((item) => item !== option),
		);
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { value, checked } = e.target;
		setNfrsSelected((prev) =>
			checked ? [...prev, value] : prev.filter((item) => item !== value),
		);
	};

	return (
		<>
			<Dialog
				open={open}
				onOpenChange={handleOpenChange}
				title={t("Choose the most suitable non-functional requirements")}
				closeOnOverlayClick
				closeOnEscape
				contentStyle={{ backgroundColor: "white" }}
				titleStyle={{
					fontSize: "1.4em",
					fontWeight: "bold",
					marginLeft: "12px",
				}}
			>
				<div className="modal-body" style={{ padding: "6px" }}>
					<form
						className="form-horizontal"
						role="form"
						onSubmit={(event) => {
							event.preventDefault();
							handleSave();
						}}
					>
						<div className="form-group" style={{ margin: "16px" }}>
							<div>
								{NFR_OPTIONS.map((option, index) => (
									<div key={index} style={{ marginBottom: "12px", cursor: "pointer" }} onClick={() => handleClick(option.name)}>
										<div style={{ display: "flex", alignItems: "center" }}>
											<input
												type="checkbox"
												name="model-type"
												value={option.name}
												checked={isChecked(option.name)}
												onChange={handleChange}
												style={{ margin: "8px" }}
											/>
											<span style={{ fontWeight: "bold", fontSize: "1.3em" }}>
												{t(option.name)}
											</span>
										</div>
										<div
											style={{
												marginLeft: "30px",
												fontSize: "1.1em",
												fontWeight: "lighter",
											}}
										>
											<span>{t(option.description)}</span>
										</div>
									</div>
								))}
							</div>
						</div>
					</form>
				</div>
				<div className="modal-footer" style={{ paddingTop: "8px" }}>
					<button
						className="polyglot-style-secondary-button "
						type="button"
						onClick={onCancel}
					>
						{t("Cancel")}
					</button>
					<button
						className="polyglot-style-primary-button "
						type="submit"
						onClick={handleSave}
					>
						{t("Confirm")}
					</button>
				</div>
			</Dialog>
		</>
	);
};

export default NfrModal;
